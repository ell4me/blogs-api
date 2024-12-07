import { NextFunction, Response, Request } from 'express';
import { HTTP_STATUSES } from '../constants';
import { LimitData, RateLimitModel } from '../modules/rateLimit/rateLimit.model';
import { rateLimitService } from '../modules/rateLimit/rateLimit.service';

export const rateLimitMiddleware =
	(limitData: LimitData) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { ip, baseUrl: url } = req;
			const date = new Date().getTime();

			const rateLimit: RateLimitModel = {
				url,
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
