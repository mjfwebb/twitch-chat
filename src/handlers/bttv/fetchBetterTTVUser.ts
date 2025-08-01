/// https://api.betterttv.net/3/cached/users/{provider}/{providerId}

import { logger } from '../../utils/logger';
import { bttvUserSchema, type BttvUser } from './schemas';

export const fetchBetterTTVUser = async (broadcasterId: string): Promise<BttvUser | null> => {
  try {
    const url = `https://api.betterttv.net/3/cached/users/twitch/${broadcasterId}`;
    const response = await fetch(url, { method: 'GET' });
    const json = await response.json();
    const result = bttvUserSchema.safeParse(json);
    if (result.success) {
      logger.info(`Fetched BetterTTV user`);
      return bttvUserSchema.parse(json);
    } else {
      logger.error(`JSON response from BetterTTV API is not valid. Error: ${result.error.message}`);
      return json as BttvUser;
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
