import { fetchBadges } from './handlers/twitch/helix/fetchBadges';
import { fetchCheers } from './handlers/twitch/helix/fetchCheers';
import { fetchUserInformation } from './handlers/twitch/helix/fetchUserInformation';
import { validateAccessToken } from './handlers/twitch/id/validateAccessToken';
import { useMount } from './hooks/useMount';
import { loadEmotes } from './loadEmotes';
import { persistedStore, store } from './store/store';
import { logger } from './utils/logger';

async function getBroadcasterIdFromAccessToken(): Promise<{ id: string; login: string } | null> {
  const result = await validateAccessToken();
  if (result) {
    return {
      id: result.user_id,
      login: result.login,
    };
  }

  return null;
}

async function getBroadcasterIdFromChannel(channel: string): Promise<string | null> {
  const data = await fetchUserInformation(channel);
  if (data) {
    return data.id;
  }

  return null;
}

export const TwitchBroadcasterIdLoader = () => {
  const accessToken = persistedStore((s) => s.accessToken);
  const broadcasterId = store((s) => s.broadcasterId);
  const userId = store((s) => s.userId);
  const userLogin = store((s) => s.userLogin);
  const channel = persistedStore((s) => s.channel);

  useMount(() => {
    async function getBroadcasterId() {
      if (!accessToken) {
        return;
      }
      let loadedBroadcasterId: string | null = broadcasterId;

      // If a channel is specified, try to get the broadcaster ID from the channel name
      if (channel) {
        loadedBroadcasterId = await getBroadcasterIdFromChannel(channel);
        logger.info(`Loaded broadcaster ID: ${loadedBroadcasterId} from channel: ${channel}`);
      }

      // If we still don't have a broadcaster ID, try to get it from the access token,
      // which will also set the user ID
      if (!loadedBroadcasterId || !userId || !userLogin) {
        const res = await getBroadcasterIdFromAccessToken();
        if (!res) {
          logger.error('Failed to get broadcaster ID from access token');
          return;
        }
        if (res.id && res.login) {
          logger.info(`Loaded broadcaster ID: ${res.id} from access token`);
          loadedBroadcasterId ??= res.id;
          logger.info(`Loaded user ID: ${res.id} from access token`);
          store.getState().setUserId(res.id);
          store.getState().setUserLogin(res.login);
        }
      }

      if (loadedBroadcasterId) {
        store.getState().setBroadcasterId(loadedBroadcasterId);
        fetchBadges('channel');
        fetchCheers('channel');
        await loadEmotes(loadedBroadcasterId);
      }
    }
    void getBroadcasterId();
  });

  return null;
};
