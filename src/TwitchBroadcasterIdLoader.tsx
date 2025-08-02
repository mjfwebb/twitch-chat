import { useState } from 'react';
import z from 'zod';
import { TWITCH_AUTH_URL } from './constants';
import { fetchBadges } from './handlers/twitch/helix/fetchBadges';
import { fetchCheers } from './handlers/twitch/helix/fetchCheers';
import { useMount } from './hooks/useMount';
import { loadEmotes } from './loadEmotes';
import { persistedStore, store } from './store/store';

const ValidateResponseSchema = z.object({
  client_id: z.string(),
  login: z.string(),
  scopes: z.array(z.string()),
  user_id: z.string(),
  expires_in: z.number(),
});

// We use the validate endpoint to check if the access token is valid and to retrieve the broadcaster ID

export const TwitchBroadcasterIdLoader = () => {
  const accessToken = persistedStore((s) => s.accessToken);
  const [error, setError] = useState<string | null>(null);
  const broadcasterId = store((s) => s.broadcasterId);

  useMount(() => {
    async function validateToken() {
      if (accessToken && !broadcasterId) {
        // Fetch broadcaster ID using the access token
        const result = await fetch(`${TWITCH_AUTH_URL}validate`, {
          headers: {
            Authorization: 'OAuth ' + accessToken,
          },
        });

        const data = await result.json();
        const parsed = ValidateResponseSchema.safeParse(data);
        if (parsed.success) {
          // If validation is successful, update the store with the broadcaster ID
          const broadcasterId = parsed.data.user_id;
          store.getState().setBroadcasterId(broadcasterId);

          fetchBadges('channel');
          fetchCheers('channel');
          await loadEmotes(broadcasterId);
        } else {
          setError('Invalid token response: ' + parsed.error.message);
          console.error('Invalid token response:', parsed.error);
        }
      }
    }
    void validateToken();
  });

  if (error) {
    return <span>Error: {error}</span>;
  }

  return null;
};
