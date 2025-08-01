import { logger } from "../../../../utils/logger";
import { eventSubscribe } from "./eventSubscribe";

export const subscribeToChat = async (
  broadcasterId: string,
  sessionId: string
) => {
  try {
    await eventSubscribe(sessionId, "channel.chat.message", {
      broadcaster_user_id: broadcasterId,
      user_id: broadcasterId,
    });
    await eventSubscribe(sessionId, "channel.chat.message_delete", {
      broadcaster_user_id: broadcasterId,
      user_id: broadcasterId,
    });
  } catch (error) {
    logger.error(error);
  }
};
