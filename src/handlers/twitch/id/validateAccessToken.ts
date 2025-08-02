// https://api.twitch.tv/helix/users

import { TWITCH_AUTH_URL } from '../../../constants';
import { persistedStore } from '../../../store/store';
import { logger } from '../../../utils/logger';
import { ValidateResponse, ValidateResponseSchema } from './schemas';

export const validateAccessToken = async (): Promise<ValidateResponse | null> => {
  try {
    const url = `${TWITCH_AUTH_URL}validate`;
    const accessToken = persistedStore.getState().accessToken;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    const result: unknown = await response.json();

    const parsed = ValidateResponseSchema.safeParse(result);
    if (parsed.success) {
      const data = parsed.data;
      return data;
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
