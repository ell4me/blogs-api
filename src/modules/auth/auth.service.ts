import { compare, hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { AuthLoginDto } from './auth.dto';
import { VALIDATION_MESSAGES } from '../../constants';
import { Tokens, UserCreateDto, UserModel } from '../users/users.dto';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';
import { ValidationErrorViewDto } from '../../types';
import { EmailAdapter, emailAdapter } from '../../adapters/emailAdapter';
import {
	SecurityDevicesService,
	securityDevicesService,
} from '../securityDevices/securityDevices.service';
import { SecurityDevicesUpdate } from '../securityDevices/securityDevices.dto';
import { UsersService, usersService } from '../users/users.service';

class AuthService {
	private usersService: UsersService;
	private emailAdapter: EmailAdapter;
	private securityDevicesService: SecurityDevicesService;

	constructor(
		usersService: UsersService,
		emailAdapter: EmailAdapter,
		securityDevicesService: SecurityDevicesService,
	) {
		this.usersService = usersService;
		this.emailAdapter = emailAdapter;
		this.securityDevicesService = securityDevicesService;
	}

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

		const createdUser: UserModel = {
			id,
			login,
			email,
			password: passwordHash,
			createdAt: new Date().toISOString(),
			emailConfirmation: {
				code: uuidv4(),
				expiration: add(new Date(), { hours: 1 }).getTime(),
				isConfirmed: false,
			},
		};

		await this.usersService.createUserRegistration(createdUser);

		this.emailAdapter
			.sendEmail(createdUser.email, createdUser.emailConfirmation.code)
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
			return getErrorMessage(VALIDATION_MESSAGES.CONFIRMATION_CODE_IS_NOT_CORRECT);
		}

		if (user.emailConfirmation.isConfirmed) {
			return getErrorMessage(VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED);
		}

		if (user.emailConfirmation.expiration < new Date().getTime()) {
			return getErrorMessage(VALIDATION_MESSAGES.CONFIRMATION_CODE_EXPIRED);
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

		this.emailAdapter.sendEmail(user.email, confirmationCode).catch(() => console.error('Send email failed'));
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
}

export const authService = new AuthService(usersService, emailAdapter, securityDevicesService);
