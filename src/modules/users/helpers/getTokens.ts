import { Tokens, UserModel } from '../users.dto';
import { sign } from 'jsonwebtoken';
import { addSeconds } from 'date-fns/addSeconds';
import { SETTINGS } from '../../../constants';

export const getTokens = (user: UserModel): Tokens => ({
	refreshToken: sign({
		login: user.login,
		expiration: addSeconds(new Date(), 20).getTime(),
	}, SETTINGS.JWT_REFRESH_SECRET),
	accessToken: sign({
		userId: user.id,
		expiration: addSeconds(new Date(), 10).getTime(),
	}, SETTINGS.JWT_SECRET),
});