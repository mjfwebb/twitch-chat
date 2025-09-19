// https://api.twitch.tv/helix/users

import { TWITCH_HELIX_URL } from '../../../constants';
import { persistedStore, store } from '../../../store/store';
import { logger } from '../../../utils/logger';
import { UserInformation, UserInformationResponseSchema } from './schemas';

export const fetchUserInformation = async (loginName: string): Promise<UserInformation | null> => {
  try {
    const url = `${TWITCH_HELIX_URL}users?login=${loginName}`;
    const accessToken = persistedStore.getState().getAccessToken();
    const clientId = store.getState().clientId;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Client-Id': clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result: unknown = await response.json();

    const parsed = UserInformationResponseSchema.safeParse(result);
    if (parsed.success) {
      const data = parsed.data.data;
      if (Array.isArray(data) && data.length > 0) {
        return data[0]; // Return the first user information object
      } else {
        logger.warn('No user information found or data is not an array.');
      }
    }
  } catch (error) {
    logger.error(`Failed to fetch user information for ${loginName}: ${error}`);
  }

  return null;
};
