import { Router } from 'express';

import { authService } from './auth.service';
import {
	AuthLoginDto,
	PasswordRecoveryDto,
	PasswordRecoveryEmailDto,
	RegistrationConfirmationDto,
	RegistrationEmailResendingDto,
} from './auth.dto';

import { ReqBody } from '../../types';
import { HTTP_STATUSES } from '../../constants';
import { fieldsCheckErrorsMiddleware, stringMiddleware } from '../../middlewares/validation';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { UserCreateDto } from '../users/users.dto';
import { patternMiddleware, PATTERNS } from '../../middlewares/validation/pattern.middleware';
import { usersQueryRepository } from '../users/users.query-repository';
import { getRateLimitMiddleware } from '../../middlewares/rateLimit.middleware';
import { refreshTokenMiddleware } from '../../middlewares/refreshToken.middleware';

export const authRouter = Router();
const rateLimitMiddleware = getRateLimitMiddleware({ limit: 5, ttlInSeconds: 10 });
const validationLoginMiddlewares = [
	rateLimitMiddleware,
	stringMiddleware({ field: 'loginOrEmail' }),
	stringMiddleware({ field: 'password' }),
	fieldsCheckErrorsMiddleware,
];

const validationRegistrationMiddlewares = [
	rateLimitMiddleware,
	stringMiddleware({ field: 'login', maxLength: 10, minLength: 3 }),
	patternMiddleware('login', PATTERNS.LOGIN),
	stringMiddleware({ field: 'password', maxLength: 20, minLength: 6 }),
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
];

class AuthController {
	constructor() {}
}

authRouter.post(
	'/login',
	...validationLoginMiddlewares,
	async (req: ReqBody<AuthLoginDto>, res) => {
		try {
			const token = await authService.login(req.body, req.ip!, req.headers['user-agent']);
			if (!token) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
				return;
			}

			res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: true });
			res.send({ accessToken: token.accessToken });
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

authRouter.post(
	'/registration',
	...validationRegistrationMiddlewares,
	async (req: ReqBody<UserCreateDto>, res) => {
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
	},
);

authRouter.get('/me', authBearerMiddleware, fieldsCheckErrorsMiddleware, async (req, res) => {
	try {
		const userInfo = await usersQueryRepository.getCurrentUser(req.user.id!);
		res.send(userInfo);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.post(
	'/registration-confirmation',
	rateLimitMiddleware,
	stringMiddleware({ field: 'code' }),
	fieldsCheckErrorsMiddleware,
	async (req: ReqBody<RegistrationConfirmationDto>, res) => {
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
	},
);

authRouter.post(
	'/registration-email-resending',
	rateLimitMiddleware,
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
	},
);

authRouter.post('/refresh-token', refreshTokenMiddleware, async (req, res) => {
	try {
		const token = await authService.refreshToken(req.user.deviceId!, {
			userId: req.user.id!,
			ip: req.ip!,
			deviceName: req.headers['user-agent']!,
		});

		if (!token) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
			return;
		}

		res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: true });
		res.send({ accessToken: token.accessToken });
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.post('/logout', refreshTokenMiddleware, async (req, res) => {
	try {
		const isLogout = await authService.logout(req.user.deviceId!);

		if (!isLogout) {
			res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

authRouter.post(
	'/password-recovery',
	rateLimitMiddleware,
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
	async (req: ReqBody<PasswordRecoveryEmailDto>, res) => {
		try {
			await authService.sendPasswordRecoveryEmail(req.body.email);
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

authRouter.post(
	'/new-password',
	rateLimitMiddleware,
	stringMiddleware({ field: 'newPassword', maxLength: 20, minLength: 6 }),
	stringMiddleware({ field: 'recoveryCode' }),
	fieldsCheckErrorsMiddleware,
	async (req: ReqBody<PasswordRecoveryDto>, res) => {
		try {
			const result = await authService.updateUserPasswordByRecoveryCode(req.body);

			if ('errorsMessages' in result) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
				return;
			}

			if (!result.result) {
				res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);
