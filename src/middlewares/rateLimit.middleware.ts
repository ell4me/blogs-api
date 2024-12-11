import { NextFunction, Response, Request } from 'express';
import { HTTP_STATUSES } from '../constants';
import { RateLimitDocument } from '../modules/rateLimit/rateLimit.model';
import { rateLimitService } from '../modules/rateLimit/rateLimit.service';
import { LimitData } from '../modules/rateLimit/rateLimit.types';

export const getRateLimitMiddleware =
	(limitData: LimitData) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { ip, path, baseUrl } = req;
			const date = new Date().getTime();

			const rateLimit: RateLimitDocument = {
				url: baseUrl + path,
				date,
				ip: ip!,
			};

			const result = await rateLimitService.checkRateLimit(rateLimit, limitData);

			if (result) {
				next();
				return;
			}

			res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	};
