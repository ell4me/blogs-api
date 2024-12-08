import { Tokens } from '../users.dto';
import { sign } from 'jsonwebtoken';
import { EXPIRATION_TOKEN, SETTINGS } from '../../../constants';
import { addSeconds } from 'date-fns/addSeconds';

export const getTokens = (userId: string, deviceId: string): Tokens => ({
	refreshToken: sign({
		userId,
		deviceId,
	}, SETTINGS.JWT_REFRESH_SECRET),
	accessToken: sign({
		userId,
		expiration: addSeconds(new Date(), EXPIRATION_TOKEN.ACCESS).getTime(),
	}, SETTINGS.JWT_SECRET),
});