import { NextFunction, Request, Response } from 'express';
import { Buffer } from 'buffer';
import { HTTP_STATUSES, SETTINGS } from '../constants';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization?.split('Basic ')[1];

	if (authHeader) {
		const decodedAuth = Buffer.from(authHeader, 'base64').toString();
		const credentials = `${SETTINGS.LOGIN}:${SETTINGS.PASSWORD}`;

		if (decodedAuth === credentials) {
			next();
			return;
		}
	}

	res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
};
