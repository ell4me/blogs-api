import { compare, hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { AuthLoginDto, PasswordRecoveryDto } from './auth.dto';
import { VALIDATION_MESSAGES } from '../../constants';
import { UserCreateDto } from '../users/users.dto';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';
import { ValidationErrorViewDto } from '../../types';
import { EmailAdapter, emailAdapter } from '../../adapters/emailAdapter';
import {
	SecurityDevicesService,
	securityDevicesService,
} from '../securityDevices/securityDevices.service';
import { UsersService, usersService } from '../users/users.service';
import { SecurityDevicesUpdate } from '../securityDevices/securityDevices.types';
import { PasswordRecovery, Tokens, UserCreate } from '../users/users.types';

export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly emailAdapter: EmailAdapter,
		private readonly securityDevicesService: SecurityDevicesService,
	) {}

	async login(
		{ loginOrEmail, password }: AuthLoginDto,
		ip: string,
		deviceName?: string,
	): Promise<Tokens | void> {
		const user = await this.usersService.getUserByEmailOrLogin({
			email: loginOrEmail,
			login: loginOrEmail,
		});

		if (!user) {
			return;
		}

		const isCorrectPassword = await compare(password, user.password);

		if (!isCorrectPassword) {
			return;
		}

		return securityDevicesService.createDeviceSession({
			userId: user.id,
			ip,
			deviceName: deviceName || 'Unknown',
		});
	}

	async registration({
		email,
		password,
		login,
	}: UserCreateDto): Promise<ValidationErrorViewDto | void> {
		const user = await this.usersService.getUserByEmailOrLogin({ email, login });

		if (user) {
			return validateUserIsExist(user, email);
		}

		const id = new Date().getTime().toString();
		const passwordHash = await hash(password, 10);

		const createdUser: UserCreate = {
			id,
			login,
			email,
			password: passwordHash,
			emailConfirmation: {
				code: uuidv4(),
				expiration: add(new Date(), { hours: 1 }).getTime(),
				isConfirmed: false,
			},
		};

		await this.usersService.createUserRegistration(createdUser);

		this.emailAdapter
			.sendEmailConfirmation(createdUser.email, createdUser.emailConfirmation.code)
			.catch(() => this.registrationEmailResending(email));
	}

	async registrationConfirmation(
		confirmationCode: string,
	): Promise<ValidationErrorViewDto | void> {
		const user = await this.usersService.getUserByConfirmationCode(confirmationCode);

		const getErrorMessage = (message: string) => ({
			errorsMessages: [{ field: 'code', message }],
		});

		if (!user) {
			return getErrorMessage(VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Confirmation'));
		}

		if (user.emailConfirmation.isConfirmed) {
			return getErrorMessage(VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED);
		}

		if (user.emailConfirmation.expiration < new Date().getTime()) {
			return getErrorMessage(VALIDATION_MESSAGES.CODE_EXPIRED('Confirmation'));
		}

		await usersService.updateUserEmailConfirmation(user.id, {
			...user.emailConfirmation,
			isConfirmed: true,
		});
	}

	async registrationEmailResending(email: string): Promise<ValidationErrorViewDto | void> {
		const user = await this.usersService.getUserByEmailOrLogin({ email });

		if (!user) {
			return {
				errorsMessages: [
					{ field: 'email', message: VALIDATION_MESSAGES.USER_IS_NOT_FOUND },
				],
			};
		}

		if (user.emailConfirmation.isConfirmed) {
			return {
				errorsMessages: [
					{ field: 'email', message: VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED },
				],
			};
		}

		const confirmationCode = uuidv4();

		await this.usersService.updateUserEmailConfirmation(user.id, {
			code: confirmationCode,
			expiration: add(new Date(), { hours: 1 }).getTime(),
			isConfirmed: false,
		});

		this.emailAdapter
			.sendEmailConfirmation(user.email, confirmationCode)
			.catch(() => console.error('Send email failed'));
	}

	async refreshToken(
		deviceId: string,
		securityDevicesUpdate: SecurityDevicesUpdate,
	): Promise<Tokens | void> {
		return this.securityDevicesService.updateCurrentDeviceSession(
			deviceId,
			securityDevicesUpdate,
		);
	}

	async logout(deviceId: string): Promise<boolean> {
		return this.securityDevicesService.deleteSessionByDeviceId(deviceId);
	}

	async sendPasswordRecoveryEmail(email: string): Promise<void> {
		const user = await this.usersService.getUserByEmailOrLogin({ email });

		if (!user) {
			return;
		}

		const passwordRecovery: PasswordRecovery = {
			code: uuidv4(),
			expiration: add(new Date(), { hours: 1 }).getTime(),
		};

		await this.usersService.updateUserPasswordRecovery(user.id, passwordRecovery);

		await this.emailAdapter
			.sendEmailRecoveryPassword(email, passwordRecovery.code)
			.catch(() => console.error('Send email failed'));

		return;
	}

	async updateUserPasswordByRecoveryCode({
		recoveryCode,
		newPassword,
	}: PasswordRecoveryDto): Promise<ValidationErrorViewDto | { result: boolean }> {
		const user = await this.usersService.getUserByPasswordRecoveryCode(recoveryCode);

		if (!user) {
			return {
				errorsMessages: [
					{
						message: VALIDATION_MESSAGES.CODE_IS_NOT_CORRECT('Recovery'),
						field: 'recoveryCode',
					},
				],
			};
		}

		if (
			!user.passwordRecovery?.expiration ||
			user.passwordRecovery.expiration < new Date().getTime()
		) {
			return {
				errorsMessages: [
					{
						message: VALIDATION_MESSAGES.CODE_EXPIRED('Recovery'),
						field: 'recoveryCode',
					},
				],
			};
		}

		const newPasswordHash = await hash(newPassword, 10);

		await this.usersService.updateUserPasswordRecovery(user.id, { code: '', expiration: 0 });
		const result = await this.usersService.updateUserPassword(user.id, newPasswordHash);

		return { result };
	}
}

export const authService = new AuthService(usersService, emailAdapter, securityDevicesService);
