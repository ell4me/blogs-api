import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ReqBody } from '../../types';
import {
	AuthLoginDto,
	PasswordRecoveryDto,
	PasswordRecoveryEmailDto,
	RegistrationConfirmationDto,
	RegistrationEmailResendingDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { HTTP_STATUSES } from '../../constants';
import { UserCreateDto } from '../users/users.dto';
import { UsersQueryRepository } from '../users/users.query-repository';

@injectable()
export class AuthController {
	constructor(
		@inject(AuthService) private readonly authService: AuthService,
		@inject(UsersQueryRepository) private readonly usersQueryRepository: UsersQueryRepository,
	) {}

	async login(req: ReqBody<AuthLoginDto>, res: Response) {
		try {
			const token = await this.authService.login(
				req.body,
				req.ip!,
				req.headers['user-agent'],
			);
			if (!token) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
				return;
			}

			res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: true });
			res.send({ accessToken: token.accessToken });
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async registration(req: ReqBody<UserCreateDto>, res: Response) {
		try {
			const result = await this.authService.registration(req.body);

			if (result) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async getCurrentUser(req: Request, res: Response) {
		try {
			const userInfo = await this.usersQueryRepository.getCurrentUser(req.user?.id!);
			res.send(userInfo);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async registrationConfirmation(req: ReqBody<RegistrationConfirmationDto>, res: Response) {
		try {
			const result = await this.authService.registrationConfirmation(req.body.code);

			if (result) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async registrationEmailResending(req: ReqBody<RegistrationEmailResendingDto>, res: Response) {
		try {
			const result = await this.authService.registrationEmailResending(req.body.email);

			if (result) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async refreshToken(req: Request, res: Response) {
		try {
			const token = await this.authService.refreshToken(req.user.deviceId!, {
				userId: req.user?.id!,
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
	}

	async logout(req: Request, res: Response) {
		try {
			const isLogout = await this.authService.logout(req.user.deviceId!);

			if (!isLogout) {
				res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async sendPasswordRecoveryEmail(req: ReqBody<PasswordRecoveryEmailDto>, res: Response) {
		try {
			await this.authService.sendPasswordRecoveryEmail(req.body.email);
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async updateUserPasswordByRecoveryCode(req: ReqBody<PasswordRecoveryDto>, res: Response) {
		try {
			const result = await this.authService.updateUserPasswordByRecoveryCode(req.body);

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
	}
}
