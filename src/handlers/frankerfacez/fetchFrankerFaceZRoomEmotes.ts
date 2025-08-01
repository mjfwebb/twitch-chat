// https://api.frankerfacez.com/v1/room/id/

import { logger } from "../../utils/logger";
import {
  frankerFaceZRoomEmotesSchema,
  type FrankerFaceZRoomEmotes,
} from "./schemas";

export const fetchFrankerFaceZRoomEmotes = async (
  broadcasterId: string
): Promise<FrankerFaceZRoomEmotes | null> => {
  try {
    const url = `https://api.frankerfacez.com/v1/room/id/${broadcasterId}`;
    const response = await fetch(url, { method: "GET" });
    const json = await response.json();
    const result = frankerFaceZRoomEmotesSchema.safeParse(json);
    if (result.success) {
      logger.info(`Fetched FrankerFaceZ room emotes`);
      return frankerFaceZRoomEmotesSchema.parse(json);
    } else {
      logger.error(
        `JSON response from FrankerFaceZ API (fetchFrankerFaceZRoomEmotes) is not valid. Error: ${result.error.message}`
      );
      return json as FrankerFaceZRoomEmotes;
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
