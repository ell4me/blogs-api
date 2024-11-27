import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';
import { HTTP_STATUSES, SETTINGS } from '../constants';


export const authBearerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split('Bearer ')[1];

	if (token) {
		try {
			const jwtPayload = verify(token, SETTINGS.JWT_SECRET);
			if(typeof jwtPayload !== 'object' || jwtPayload.expiration < new Date().getTime()) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
				return;
			}

			req.userId = jwtPayload.userId;
			next();
			return;
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
			return;
		}
	}

	res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
};
