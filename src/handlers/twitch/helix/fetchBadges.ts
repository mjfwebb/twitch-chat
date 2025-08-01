// https://api.twitch.tv/helix/chat/badges

import { TWITCH_HELIX_URL } from "../../../constants";
import { persistedStore, store } from "../../../store/store";
import { ChatBadge } from "../../../types/types";
import { logger } from "../../../utils/logger";
import { BadgeSet, BadgesResponseSchema } from "./schemas";

export const fetchBadges = async (
  type: "global" | "channel"
): Promise<void> => {
  try {
    const broadcasterId = store.getState().broadcasterId;
    // If type is 'global', we fetch global badges, otherwise we fetch channel-specific badges
    const url =
      type === "global"
        ? `${TWITCH_HELIX_URL}chat/badges/global`
        : `${TWITCH_HELIX_URL}chat/badges?broadcaster_id=${broadcasterId}`;
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

    const parsed = BadgesResponseSchema.safeParse(result);
    if (parsed.success) {
      const data = parsed.data.data;
      if (Array.isArray(data) && data.length > 0) {
        console.log("Fetched badges:", data);
        saveBadges(data);
      } else {
        logger.warn("No badges found or data is not an array.");
      }
    } else {
      logger.error("Failed to parse badges response:", parsed.error);
    }
  } catch (error) {
    logger.error(error);
  }
};

const saveBadges = async (badgeSets: BadgeSet[]) => {
  if (badgeSets.length > 0) {
    const chatBadges: Record<string, ChatBadge> = {};
    badgeSets.forEach((badgeSet) => {
      badgeSet.versions.forEach((version) => {
        const name = `${badgeSet.set_id}_${version.id}`;
        chatBadges[name] = {
          name,
          url: version.image_url_4x,
        };
      });
    });
    store.getState().setChatBadges(chatBadges);
  }
};
