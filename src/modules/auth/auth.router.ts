import { Router } from 'express';

import { fieldsCheckErrorsMiddleware, stringMiddleware } from '../../middlewares/validation';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { patternMiddleware, PATTERNS } from '../../middlewares/validation/pattern.middleware';
import { getRateLimitMiddleware } from '../../middlewares/rateLimit.middleware';
import { refreshTokenMiddleware } from '../../middlewares/refreshToken.middleware';
import { AuthController } from './auth.controller';
import { compositionRoot } from '../../inversify.config';

const authController = compositionRoot.resolve(AuthController);
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

authRouter.post('/login', ...validationLoginMiddlewares, authController.login.bind(authController));

authRouter.post(
	'/registration',
	...validationRegistrationMiddlewares,
	authController.registration.bind(authController),
);

authRouter.get(
	'/me',
	authBearerMiddleware,
	fieldsCheckErrorsMiddleware,
	authController.getCurrentUser.bind(authController),
);

authRouter.post(
	'/registration-confirmation',
	rateLimitMiddleware,
	stringMiddleware({ field: 'code' }),
	fieldsCheckErrorsMiddleware,
	authController.registrationConfirmation.bind(authController),
);

authRouter.post(
	'/registration-email-resending',
	rateLimitMiddleware,
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
	authController.registrationEmailResending.bind(authController),
);

authRouter.post(
	'/refresh-token',
	refreshTokenMiddleware,
	authController.refreshToken.bind(authController),
);

authRouter.post('/logout', refreshTokenMiddleware, authController.logout.bind(authController));

authRouter.post(
	'/password-recovery',
	rateLimitMiddleware,
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
	authController.sendPasswordRecoveryEmail.bind(authController),
);

authRouter.post(
	'/new-password',
	rateLimitMiddleware,
	stringMiddleware({ field: 'newPassword', maxLength: 20, minLength: 6 }),
	stringMiddleware({ field: 'recoveryCode' }),
	fieldsCheckErrorsMiddleware,
	authController.updateUserPasswordByRecoveryCode.bind(authController),
);
