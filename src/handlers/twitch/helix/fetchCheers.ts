// https://api.twitch.tv/helix/bits/cheermotes

import { TWITCH_HELIX_URL } from "../../../constants";
import { persistedStore, store } from "../../../store/store";
import { ChatCheer } from "../../../types/types";
import { logger } from "../../../utils/logger";
import { Cheermote, CheersResponseSchema } from "./schemas";

export const fetchCheers = async (
  type: "global" | "channel"
): Promise<void> => {
  try {
    const broadcasterId = store.getState().broadcasterId;
    // If type is 'global', we fetch global cheers, otherwise we fetch channel-specific cheers
    const url =
      type === "global"
        ? `${TWITCH_HELIX_URL}bits/cheermotes`
        : `${TWITCH_HELIX_URL}bits/cheermotes?broadcaster_id=${broadcasterId}`;
    const accessToken = persistedStore.getState().getAccessToken();
    const clientId = store.getState().clientId;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result: unknown = await response.json();

    const parsed = CheersResponseSchema.safeParse(result);
    if (parsed.success) {
      const data = parsed.data.data;
      if (Array.isArray(data) && data.length > 0) {
        saveCheers(data);
      } else {
        logger.warn("No cheers found or data is not an array.");
      }
    } else {
      logger.error("Failed to parse cheers response:", parsed.error);
    }
  } catch (error) {
    logger.error(error);
  }
};

const saveCheers = async (cheers: Cheermote[]) => {
  if (cheers.length > 0) {
    const chatCheers: Record<string, ChatCheer> = {};
    cheers.forEach((cheer) => {
      cheer.tiers.forEach((tier) => {
        const name = `${cheer.prefix}${tier.min_bits}`;
        chatCheers[name] = {
          name,
          color: tier.color,
          url: tier.images.dark.animated["4"],
          minBits: tier.min_bits,
        };
      });
    });
    store.getState().setChatCheers(chatCheers);
  }
};
