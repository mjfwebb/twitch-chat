import { SEVEN_TV_WEBSOCKET_URL } from '../../constants';
import { addSevenTVEmote, removeSevenTVEmote } from '../../loadEmotes';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import { logger } from '../../utils/logger';
import type { SevenTVEmote, SevenTVTwitchUser } from './schemas';

const closeCodes = {
  ServerError: 4000, // An error occurred on the server's end
  UnknownOperation: 4001, // the client sent an unknown opcode
  InvalidPayload: 4002, // the client sent a payload that couldn't be decoded
  AuthFailure: 4003, // the client unsuccessfully tried to identify
  AlreadyIdentified: 4004, // the client wanted to identify again
  RateLimited: 4005, // the client sent too many payloads too fast
  Restart: 4006, // the server is restarting and the client should reconnect
  Maintenance: 4007, // the server is in maintenance mode and not accepting connections
  Timeout: 4008, // the client was idle for too long
  AlreadySubscribed: 4009, // the client tried to subscribe to an event twice
  NotSubscribed: 4010, // the client tried to unsubscribe from an event they weren't subscribed to
  InsufficientPrivilege: 4011, // the client did something they did not have permission for
} as const;

const SevenTVWebsocketOpCodes = {
  Dispatch: 0, // A standard event message, sent when a subscribed event is emitted
  Hello: 1, // Received upon connecting, presents info about the session
  Heartbeat: 2, // Ensures the connection is still alive
  Reconnect: 4, // Server wants the client to reconnect
  Acknowledgement: 5, // Server acknowledges an action by the client
  Error: 6, // An error occurred, you should log this
  EndOfStream: 7, // The server will send no further data and imminently end the connection
  Identify: 33, // Authenticate with an account
  Resume: 34, // Try to resume a previous session
  Subscribe: 35, // Watch for changes on specific objects or sources. Don't smash it!
  Unsubscribe: 36, // Stop listening for changes
  Signal: 37,
} as const;

interface SevenTVWebsocketInboundMessage<T> {
  op: number;
  t: number;
  d: T;
}

interface SevenTVWebsocketOutboundMessage<T> {
  op: number;
  d: T;
}

type ChangeField = {
  key: string; // the key in context
  index?: number; //	if the field is an array, this is the index of the item within the array that was updated
  nested?: boolean; //	if true, this means the current value is nested deeper
  old_value: unknown; //	object or nil	the previous value
  value: unknown; // object, []ChangeField or nil
};

type DispatchMessage = SevenTVWebsocketInboundMessage<{
  type: string; // The type of event
  body: {
    id: string; // ObjectID	the object's ID
    kind: number; // int8	the object kind
    contextual?: boolean; // 	bool	if true, this event represents a change local only to the current session
    actor: string; // User	the user responsible for these changes
    added?: ChangeField[]; // 	[]ChangeField	a list of added fields
    updated?: ChangeField[]; // 	[]ChangeField	a list of updated fields
    removed?: ChangeField[]; // 	[]ChangeField	a list of removed fields
    pushed?: ChangeField[]; // 	[]ChangeField	a list of items pushed to an array
    pulled?: ChangeField[]; // 	[]ChangeField	a list of items pulled from an array
  };
}>;

type HelloMessage = SevenTVWebsocketInboundMessage<{
  heartbeat_interval: number;
  session_id: string;
  subscription_limit: number;
}>;

type HeartbeatMessage = SevenTVWebsocketInboundMessage<{
  count: number;
}>;

type EndOfStreamMessage = SevenTVWebsocketInboundMessage<{
  code: number; // The close code
  message: string; // The close reason
}>;

type AcknowledgementMessage = SevenTVWebsocketInboundMessage<{
  command: string; // The command that was acknowledged
  data: unknown; // The data that was sent with the command
}>;

// Not used
// type IdentifyMessage = SevenTVWebsocketOutboundMessage<{
// }>;

// Not used
// type ResumeMessage = SevenTVWebsocketOutboundMessage<{
//   session_id: string; // The session ID to resume
// }>;

type SubscribeMessage = SevenTVWebsocketOutboundMessage<{
  type: string; // subscription type
  condition: Record<string, string>; // filter messages by conditions
}>;

// Not used
// type UnsubscribeMessage = SevenTVWebsocketOutboundMessage<{
//   type: string; // subscription type
//   condition?: Record<string, string>; // filter messages by conditions
// }>;
const MAX_RECONNECT_RETRIES = 8; // Maximum reconnect attempts before giving up
const BASE_RECONNECT_DELAY_MS = 1000; // 1s base delay
const MAX_RECONNECT_DELAY_MS = 60_000; // Cap at 60s
const RATE_LIMIT_MIN_DELAY_MS = 30_000; // If rate-limited, wait at least 30s before retry

let heartbeat: number | undefined; // Interval for heartbeat
let missedHeartbeats = 0;

// Reconnect/backoff controls
let reconnectTimeout: number | undefined;
let retryCount = 0;

const isSubscribed = false;

function createSubscribeMessage(type: string, condition: Record<string, string>): SubscribeMessage {
  return {
    op: SevenTVWebsocketOpCodes.Subscribe,
    d: {
      type,
      condition,
    },
  };
}

let socket: WebSocket;

export function runSevenTVWebsocket(sevenTVTwitchUser: SevenTVTwitchUser) {
  socket = new WebSocket(SEVEN_TV_WEBSOCKET_URL);

  // Helper to compute backoff with jitter
  const computeBackoff = (attempt: number, minDelay = BASE_RECONNECT_DELAY_MS) => {
    const exp = Math.min(minDelay * Math.pow(2, attempt), MAX_RECONNECT_DELAY_MS);
    // Add +/- 20% jitter to avoid thundering herd
    const jitter = exp * (Math.random() * 0.4 - 0.2);
    return Math.max(0, Math.floor(exp + jitter));
  };

  // Schedule a reconnect attempt with exponential backoff (or a provided delay)
  const scheduleReconnect = (reason?: string, overrideDelay?: number) => {
    if (reconnectTimeout) {
      return;
    }
    if (retryCount >= MAX_RECONNECT_RETRIES) {
      logger.error(
        `SevenTV WebSocket: Max reconnect attempts reached (${MAX_RECONNECT_RETRIES}). Stopping reconnection. Last reason: ${reason ?? 'unknown'}`,
      );
      return;
    }
    const delay = overrideDelay ?? computeBackoff(retryCount);
    logger.info(
      `SevenTV WebSocket: Reconnecting in ${delay}ms (attempt ${retryCount + 1} of ${MAX_RECONNECT_RETRIES}).${reason ? ' Reason: ' + reason : ''}`,
    );
    reconnectTimeout = window.setTimeout(() => {
      reconnectTimeout = undefined;
      retryCount++;
      runSevenTVWebsocket(sevenTVTwitchUser);
    }, delay);
  };

  socket.addEventListener('error', function (error) {
    logger.error('SevenTV WebSocket: Connection Error: ' + error.toString());
    // In browsers, onerror doesn't expose status codes (e.g., 429). We'll rely on close events or server opcodes.
    // If the socket did not open, try to reconnect with backoff.
    if (socket.readyState !== WebSocket.OPEN) {
      scheduleReconnect('error event before open');
    }
  });

  socket.addEventListener('open', function () {
    logger.info('SevenTV WebSocket: Client Connected');
    // Reset retry state on successful connect
    retryCount = 0;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = undefined;
    }
  });

  socket.addEventListener('close', function (event) {
    logger.info(`SevenTV WebSocket: Connection Closed (code: ${event.code}, reason: ${event.reason || 'n/a'})`);
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = undefined;
    }

    // Determine reconnection strategy based on close code
    // Note: 4005 (RateLimited) is specific to SevenTV close codes
    if (event.code === closeCodes.RateLimited || /429|rate.?limit/i.test(event.reason)) {
      // Apply a longer minimum delay when rate-limited
      const delay = Math.max(RATE_LIMIT_MIN_DELAY_MS, computeBackoff(retryCount, RATE_LIMIT_MIN_DELAY_MS));
      scheduleReconnect('rate limited', delay);
      return;
    }

    // Server restart/maintenance/timeouts should reconnect
    if (
      event.code === closeCodes.Restart ||
      event.code === closeCodes.Maintenance ||
      event.code === closeCodes.Timeout ||
      event.code === closeCodes.ServerError ||
      !event.wasClean
    ) {
      scheduleReconnect(`close code ${event.code}${event.reason ? ' - ' + event.reason : ''}`);
    }
  });

  socket.addEventListener('message', function (message) {
    if (hasOwnProperty(message, 'utf8Data') && typeof message.utf8Data === 'string') {
      const data: unknown = JSON.parse(message.utf8Data);
      if (hasOwnProperty(data, 'op') && hasOwnProperty(data, 't') && hasOwnProperty(data, 'd')) {
        const { op, t, d } = data as SevenTVWebsocketInboundMessage<unknown>;
        switch (op) {
          case SevenTVWebsocketOpCodes.Dispatch: {
            const { body } = d as DispatchMessage['d'];
            // An emote has been added to the user's emote set
            if ((body.pushed && body.pushed.length) || (body.added && body.added.length) || (body.updated && body.updated.length)) {
              const pushed = body.pushed || [];
              const added = body.added || [];
              const updated = body.updated || [];
              for (const entry of [...pushed, ...added, ...updated]) {
                if (entry.key === 'emotes') {
                  const emote = entry.value as SevenTVEmote;
                  logger.info(`SevenTV WebSocket: Emote added: "${emote.name}" with ID: ${emote.id}`);
                  addSevenTVEmote(emote).catch((error: unknown) => logger.error(`SevenTV WebSocket: Error adding emote: ${JSON.stringify(error)}`));
                }
              }
            }

            // An emote has been removed from the user's emote set
            if ((body.removed && body.removed.length) || (body.pulled && body.pulled.length) || (body.updated && body.updated.length)) {
              const pulled = body.pulled || [];
              const removed = body.removed || [];
              const updated = body.updated || [];
              for (const entry of [...removed, ...pulled, ...updated]) {
                if (entry.key === 'emotes') {
                  const emote = entry.old_value as SevenTVEmote;
                  logger.info(`SevenTV WebSocket: Emote removed: "${emote.name}" with ID: ${emote.id}`);
                  removeSevenTVEmote(emote.id);
                }
              }
            }

            break;
          }
          case SevenTVWebsocketOpCodes.Reconnect: {
            // Server asks us to reconnect
            logger.info('SevenTV WebSocket: Server requested reconnect');
            try {
              socket.close();
            } catch (e) {
              logger.debug('SevenTV WebSocket: Error while closing socket on reconnect request', e);
            }
            scheduleReconnect('server requested reconnect', 1000);
            break;
          }
          case SevenTVWebsocketOpCodes.Hello: {
            const { heartbeat_interval: heartbeatInterval, session_id: sessionId, subscription_limit: subscriptionLimit } = d as HelloMessage['d'];
            logger.debug(
              `SevenTV WebSocket: Hello received: ${t}. Heartbeat interval: ${heartbeatInterval}. Session ID: ${sessionId}. Subscription limit: ${subscriptionLimit}`,
            );
            // TODO: Store session ID for resuming
            // storedSessionId = sessionId;

            // Subscribe to events
            if (!isSubscribed) {
              socket.send(
                JSON.stringify(
                  createSubscribeMessage('emote_set.*', {
                    object_id: sevenTVTwitchUser.emote_set.id,
                  }),
                ),
              );
            }

            // If there is no heartbeat, start one
            if (!heartbeat) {
              heartbeat = setInterval(() => {
                missedHeartbeats++;

                // If we miss 3 heartbeats, close the connection
                if (missedHeartbeats > 3) {
                  logger.error('SevenTV WebSocket: Too many missed heartbeats, closing connection.');
                  socket.close(closeCodes.Timeout);
                  missedHeartbeats = 0;
                  return;
                }
              }, heartbeatInterval);
            }
            break;
          }
          case SevenTVWebsocketOpCodes.Error: {
            const payload = d as unknown;
            const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
            logger.error(`SevenTV WebSocket: Error opcode received: ${msg}`);
            if (/429|rate.?limit/i.test(msg)) {
              scheduleReconnect('error opcode rate limited', RATE_LIMIT_MIN_DELAY_MS);
            }
            break;
          }
          case SevenTVWebsocketOpCodes.Heartbeat: {
            const { count } = d as HeartbeatMessage['d'];
            logger.debug(`SevenTV WebSocket: Heartbeat received with count: ${count}`);
            missedHeartbeats = 0;
            break;
          }
          case SevenTVWebsocketOpCodes.Acknowledgement: {
            const { command } = d as AcknowledgementMessage['d'];
            logger.debug(`SevenTV WebSocket: Acknowledgement received for command: ${command}`);
            break;
          }
          case SevenTVWebsocketOpCodes.EndOfStream: {
            const { code, message } = d as EndOfStreamMessage['d'];
            logger.debug(`SevenTV WebSocket: End of stream received. Closing connection. Code: ${code} Reason: ${message}`);

            clearInterval(heartbeat);
            if (code === closeCodes.RateLimited || /429|rate.?limit/i.test(message)) {
              const delay = Math.max(RATE_LIMIT_MIN_DELAY_MS, BASE_RECONNECT_DELAY_MS);
              scheduleReconnect('end of stream rate limited', delay);
            } else {
              scheduleReconnect('end of stream');
            }
            break;
          }
          default:
            logger.debug(`SevenTV WebSocket: Unknown opcode received: ${op}`);
            break;
        }
      }
    }
  });
}
