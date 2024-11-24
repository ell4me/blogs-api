import { Router } from 'express';

import { authService } from './auth.service';
import { AuthLoginDto, RegistrationConfirmationDto, RegistrationEmailResendingDto } from './auth.dto';

import { ReqBody } from '../../types';
import { HTTP_STATUSES } from '../../constants';
import { fieldsCheckErrorsMiddleware, stringMiddleware } from '../../middlewares/validation';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { UserCreateDto } from '../users/users.dto';
import { patternMiddleware, PATTERNS } from '../../middlewares/validation/pattern.middleware';
import { usersQueryRepository } from '../users/users.query-repository';

export const authRouter = Router();
const validationLoginMiddlewares = [
	stringMiddleware({ field: 'loginOrEmail' }),
	stringMiddleware({ field: 'password' }),
	fieldsCheckErrorsMiddleware,
];

const validationRegistrationMiddlewares = [
	stringMiddleware({ field: 'login', maxLength: 10, minLength: 3 }),
	patternMiddleware('login', PATTERNS.LOGIN),
	stringMiddleware({ field: 'password', maxLength: 20, minLength: 6 }),
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
];

authRouter.post('/login', ...validationLoginMiddlewares, async (req: ReqBody<AuthLoginDto>, res) => {
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

authRouter.post('/registration', ...validationRegistrationMiddlewares, async (req: ReqBody<UserCreateDto>, res) => {
	try {
		const result = await authService.registration(req.body);

		if (result) {
			res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.get('/me', authBearerMiddleware, fieldsCheckErrorsMiddleware, async (req, res) => {
	try {
		const userInfo = await usersQueryRepository.getCurrentUser(req.userId!);
		res.send(userInfo);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.post('/registration-confirmation', async (req: ReqBody<RegistrationConfirmationDto>, res) => {
	try {
		const result = await authService.registrationConfirmation(req.body.code);

		if (result) {
			res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.post('/registration-email-resending',
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
	async (req: ReqBody<RegistrationEmailResendingDto>, res) => {
		try {
			const result = await authService.registrationEmailResending(req.body.email);

			if (result) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	});
