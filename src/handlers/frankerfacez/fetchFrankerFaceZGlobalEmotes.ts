// https://api.frankerfacez.com/v1/set/global

import { logger } from '../../utils/logger';
import { frankerFaceZGlobalEmotesSchema, type FrankerFaceZGlobalEmotes } from './schemas';

export const fetchFrankerFaceZGlobalEmotes = async (): Promise<FrankerFaceZGlobalEmotes | null> => {
  try {
    const url = `https://api.frankerfacez.com/v1/set/global`;
    const response = await fetch(url, { method: 'GET' });
    const json = await response.json();
    const result = frankerFaceZGlobalEmotesSchema.safeParse(json);
    if (result.success) {
      logger.info(`Fetched FrankerFaceZ global emotes`);
      return frankerFaceZGlobalEmotesSchema.parse(json);
    } else {
      logger.error(`JSON response from FrankerFaceZ API (fetchFrankerFaceZGlobalEmotes) is not valid. Error: ${result.error.message}`);
      return json as FrankerFaceZGlobalEmotes;
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
