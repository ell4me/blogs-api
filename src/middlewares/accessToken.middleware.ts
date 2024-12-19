import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';
import { SETTINGS } from '../constants';
import { ReqQuery } from '../types';

export const accessTokenMiddleware = <T = {}>(
	req: ReqQuery<T>,
	res: Response,
	next: NextFunction,
) => {
	const token = req.headers.authorization?.split('Bearer ')[1];

	if (token) {
		try {
			const jwtPayload = verify(token, SETTINGS.JWT_SECRET);
			if (typeof jwtPayload !== 'object' || jwtPayload.expiration < new Date().getTime()) {
				next();
				return;
			}

			req.user = { id: jwtPayload.userId };
			next();
			return;
		} catch (e) {
			next();
			return;
		}
	}

	next();
};
