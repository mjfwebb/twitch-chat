import { logger } from '../../../../utils/logger';
import { eventSubscribe } from './eventSubscribe';

export const subscribeToChat = async (broadcasterId: string, userId: string, sessionId: string) => {
  try {
    await eventSubscribe(sessionId, 'channel.chat.message', {
      broadcaster_user_id: broadcasterId,
      user_id: userId,
    });
    await eventSubscribe(sessionId, 'channel.chat.message_delete', {
      broadcaster_user_id: broadcasterId,
      user_id: userId,
    });
  } catch (error) {
    logger.error(error);
  }
};
