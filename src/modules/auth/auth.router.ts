import { Router } from 'express';

import { authService } from './auth.service';
import { AuthLoginDto } from './auth.dto';

import { ReqBody } from '../../types';
import { HTTP_STATUSES } from '../../constants';
import { fieldsCheckErrorsMiddleware, stringMiddleware } from '../../middlewares/validation';
import { authQueryRepository } from './auth.query-repository';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';

export const authRouter = Router();
const validationMiddlewares = [
	stringMiddleware({ field: 'loginOrEmail' }),
	stringMiddleware({ field: 'password' }),
	fieldsCheckErrorsMiddleware,
];

authRouter.post('/login', ...validationMiddlewares, async (req: ReqBody<AuthLoginDto>, res) => {
	try {
		const token = await authService.login(req.body);
		if (!token) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
			return;
		}

		res.send(token);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.get('/me', authBearerMiddleware, fieldsCheckErrorsMiddleware, async (req, res) => {
	try {
		// @ts-ignore
		const userInfo = await authQueryRepository.getCurrentUser(req.userId!);
		res.send(userInfo);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
