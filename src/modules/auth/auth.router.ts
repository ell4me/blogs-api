import { Router } from 'express';

import { authService } from './auth.service';
import { AuthLoginDto } from './auth.dto';

import { ReqBody } from '../../types';
import { HTTP_STATUSES } from '../../constants';
import { stringMiddleware } from '../../middlewares/validation';

export const authRouter = Router();
const validationMiddlewares = [
	stringMiddleware({ field: 'loginOrEmail' }),
	stringMiddleware({ field: 'password' }),
];

authRouter.post('/login', ...validationMiddlewares, async (req: ReqBody<AuthLoginDto>, res) => {
	try {
		const isAuth = await authService.login(req.body);
		if (!isAuth) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});