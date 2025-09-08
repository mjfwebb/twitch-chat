import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { TWITCH_WEBSOCKET_EVENTSUB_URL } from './constants';
import { isEventSubReconnectMessage, isEventSubWelcomeMessage, isSubscriptionEvent } from './handlers/twitch/event-sub/schemas';
import { subscribeToChat } from './handlers/twitch/event-sub/subscribers/subscribeToChat';
import { twitchEventSubHandler } from './handlers/twitch/twitchEventSubHandler';
import { store } from './store/store';
import { EventsubEvent } from './types/twitchEvents';
import { logger } from './utils/logger';

export const TwitchWebSocketClient = () => {
  const broadcasterId = store((s) => s.broadcasterId);
  const userId = store((s) => s.userId);

  // Keep the URL dynamic so we can follow Twitch's session_reconnect flow.
  const [socketUrl, setSocketUrl] = useState<string>(TWITCH_WEBSOCKET_EVENTSUB_URL);
  // Track Twitch-provided keepalive timeout to detect silent disconnects.
  const keepaliveSecondsRef = useRef<number>(10);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followingReconnectRef = useRef<boolean>(false);
  const shouldConnect = Boolean(broadcasterId && userId);

  const { lastMessage, getWebSocket } = useWebSocket<string>(
    socketUrl,
    {
      // Reconnect on close and errors; the hook will use our backoff settings.
      shouldReconnect: () => true,
      retryOnError: true,
      reconnectAttempts: 50,
      // Exponential backoff with cap at 10s: 1s, 2s, 4s, 8s, 10s...
      reconnectInterval: (attemptNumber) => Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      // Don't share so we can close the socket explicitly if needed
      share: false,
    },
    shouldConnect,
  );

  // Helper to restart an inactivity watchdog tied to Twitch's keepalive window.
  const resetInactivityWatchdog = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    const bufferMs = 2000; // small grace period
    const timeoutMs = (keepaliveSecondsRef.current || 10) * 1000 + bufferMs;
    inactivityTimerRef.current = setTimeout(() => {
      try {
        // If we have not received any messages within the keepalive window,
        // force a reconnect by closing the socket; the hook will reopen via reconnect logic.
        const ws = getWebSocket();
        // Optional chaining in case proxy limits close; share is false so this should work
        ws?.close();
      } catch {
        logger.warn('Failed to close WebSocket during inactivity timeout');
      }
    }, timeoutMs);
  }, [getWebSocket]);

  useEffect(() => {
    const data = lastMessage?.data;

    if (!data) {
      logger.warn('No data received in last message');
      return;
    }

    const jsonData = JSON.parse(data);
    switch (jsonData.metadata.message_type) {
      case 'session_welcome':
        {
          if (isEventSubWelcomeMessage(jsonData)) {
            const sessionId = jsonData.payload.session.id;
            const keepalive = jsonData.payload.session.keepalive_timeout_seconds;
            if (typeof keepalive === 'number' && keepalive >= 10) {
              keepaliveSecondsRef.current = keepalive;
            }

            // Reset inactivity watchdog on welcome
            resetInactivityWatchdog();
            // If this welcome is part of Twitch-directed reconnect flow, do not resubscribe
            if (followingReconnectRef.current) {
              followingReconnectRef.current = false;
            } else if (sessionId && broadcasterId && userId) {
              subscribeToChat(broadcasterId, userId, sessionId);
            }
          }
        }

        break;

      case 'session_keepalive':
        // Reset the inactivity watchdog on each keepalive/notification
        resetInactivityWatchdog();
        break;

      case 'notification':
        // Reset the inactivity watchdog on each keepalive/notification
        resetInactivityWatchdog();
        if (isSubscriptionEvent(jsonData.payload)) {
          // Transform the data first so that we can have a discriminated union type
          const transformedData = {
            ...jsonData.payload.event,
            eventType: jsonData.payload.subscription.type,
          } as EventsubEvent;

          twitchEventSubHandler(transformedData);
        }
        break;

      case 'session_reconnect':
        {
          if (isEventSubReconnectMessage(jsonData)) {
            const reconnectUrl = jsonData.payload.session.reconnect_url;

            // Follow Twitch guidance: immediately connect to the reconnect_url.
            // With a single socket, this will switch connections; in practice this
            // minimizes loss and aligns with EventSub expectations.
            logger.info('Following Twitch session_reconnect to new URL');
            followingReconnectRef.current = true;
            setSocketUrl(reconnectUrl);
          }
        }
        break;

      case 'revocation':
        logger.warn('EventSub subscription revoked', jsonData.payload?.subscription);
        break;
      default:
        break;
    }
  }, [broadcasterId, lastMessage, userId, getWebSocket, resetInactivityWatchdog]);

  // Clear the inactivity timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, []);

  return null; // This component does not render anything
};
