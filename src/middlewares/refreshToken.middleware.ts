import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';
import { HTTP_STATUSES, SETTINGS } from '../constants';


export const refreshTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.refreshToken;

	if (token) {
		try {
			const jwtPayload = verify(token, SETTINGS.JWT_REFRESH_SECRET);
			if (typeof jwtPayload !== 'object' || jwtPayload.expiration < new Date().getTime()) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
				return;
			}

			req.user = { id: jwtPayload.userId, deviceId: jwtPayload.deviceId };
			next();
			return;
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
			return;
		}
	}

	res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
};
