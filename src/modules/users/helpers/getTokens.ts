import { sign } from 'jsonwebtoken';
import { EXPIRATION_TOKEN, SETTINGS } from '../../../constants';
import { addSeconds } from 'date-fns/addSeconds';
import { Tokens } from '../users.types';

export const getTokens = (userId: string, deviceId: string, iat: number): Tokens => ({
	refreshToken: sign(
		{
			userId,
			deviceId,
			iat,
		},
		SETTINGS.JWT_REFRESH_SECRET,
	),
	accessToken: sign(
		{
			userId,
			expiration: addSeconds(new Date(), EXPIRATION_TOKEN.ACCESS).getTime(),
		},
		SETTINGS.JWT_SECRET,
	),
});
