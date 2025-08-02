import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { TWITCH_WEBSOCKET_EVENTSUB_URL } from './constants';
import { subscribeToChat } from './handlers/twitch/event-sub/subscribers/subscribeToChat';
import { twitchEventSubHandler } from './handlers/twitch/twitchEventSubHandler';
import { store } from './store/store';
import { EventsubEvent, EventSubResponse } from './types/twitchEvents';
import { hasOwnProperty } from './utils/hasOwnProperty';

export const TwitchWebSocketClient = () => {
  const broadcasterId = store((s) => s.broadcasterId);
  const userId = store((s) => s.userId);

  const { lastMessage } = useWebSocket<string>(TWITCH_WEBSOCKET_EVENTSUB_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    const data = lastMessage?.data;

    if (!data) {
      console.warn('No data received in last message');
      return;
    }
    const jsonData = JSON.parse(data);

    switch (jsonData.metadata.message_type) {
      case 'session_welcome':
        {
          const sessionId = jsonData.payload.session?.id;
          if (sessionId && broadcasterId && userId) {
            subscribeToChat(broadcasterId, userId, sessionId);
          }
        }

        break;

      case 'notification':
        if (isSubscriptionEvent(jsonData.payload)) {
          // Transform the data first so that we can have a discriminated union type
          const transformedData = {
            ...jsonData.payload.event,
            eventType: jsonData.payload.subscription.type,
          } as EventsubEvent;

          twitchEventSubHandler(transformedData);
        }
        break;
      default:
        break;
    }
  }, [broadcasterId, lastMessage, userId]);

  return null; // This component does not render anything
};

function isSubscriptionEvent(payload: unknown): payload is EventSubResponse {
  return (
    hasOwnProperty(payload, 'event') &&
    typeof payload.event === 'object' &&
    hasOwnProperty(payload, 'subscription') &&
    hasOwnProperty(payload.subscription, 'type') &&
    typeof payload.subscription.type === 'string'
  );
}
