import { compare, hash } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';

import { AuthLoginDto } from './auth.dto';
import { SETTINGS, VALIDATION_MESSAGES } from '../../constants';
import { Tokens, UserCreateDto, UserModel } from '../users/users.dto';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';
import { ValidationErrorViewDto } from '../../types';
import { UsersRepository, usersRepository } from '../users/users.repository';
import { EmailAdapter, emailAdapter } from '../../adapters/emailAdapter';
import { getTokens } from '../users/helpers/getTokens';

class AuthService {
	private usersRepository: UsersRepository;
	private emailAdapter: EmailAdapter;

	constructor(usersRepository: UsersRepository, emailAdapter: EmailAdapter) {
		this.usersRepository = usersRepository;
		this.emailAdapter = emailAdapter;
	}

	public async login({ loginOrEmail, password }: AuthLoginDto): Promise<Tokens | void> {
		const user = await this.usersRepository.getUserByEmailOrLogin({ email: loginOrEmail, login: loginOrEmail });

		if (!user) {
			return;
		}

		const isCorrectPassword = await compare(password, user.password);

		if (!isCorrectPassword) {
			return;
		}

		const { accessToken, refreshToken } = getTokens(user);

		await this.usersRepository.updateRefreshToken(user.id, refreshToken);

		return {
			accessToken,
			refreshToken,
		};
	}

	public async registration({ email, password, login }: UserCreateDto): Promise<ValidationErrorViewDto | void> {
		const user = await this.usersRepository.getUserByEmailOrLogin({ email, login });

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

		await this.usersRepository.createUser(createdUser);

		try {
			await this.emailAdapter.sendEmail(createdUser.email, createdUser.emailConfirmation.code);
		} catch (e) {
			await this.usersRepository.deleteUserById(createdUser.id);
			throw new Error('Send email error');
		}
	}

	public async registrationConfirmation(confirmationCode: string): Promise<ValidationErrorViewDto | void> {
		const user = await this.usersRepository.getUserByConfirmationCode(confirmationCode);

		const getErrorMessage = (message: string) => ({ errorsMessages: [{ field: 'code', message }] });

		if (!user) {
			return getErrorMessage(VALIDATION_MESSAGES.CONFIRMATION_CODE_IS_NOT_CORRECT);
		}

		if (user.emailConfirmation.isConfirmed) {
			return getErrorMessage(VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED);
		}

		if (user.emailConfirmation.expiration < new Date().getTime()) {
			return getErrorMessage(VALIDATION_MESSAGES.CONFIRMATION_CODE_EXPIRED);
		}

		await usersRepository.updateUserEmailConfirmation(user.id, { ...user.emailConfirmation, isConfirmed: true });
	}

	public async registrationEmailResending(email: string): Promise<ValidationErrorViewDto | void> {
		const user = await this.usersRepository.getUserByEmailOrLogin({ email });

		if (!user) {
			return { errorsMessages: [{ field: 'email', message: VALIDATION_MESSAGES.USER_IS_NOT_FOUND }] };
		}

		if (user.emailConfirmation.isConfirmed) {
			return { errorsMessages: [{ field: 'email', message: VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED }] };
		}

		const confirmationCode = uuidv4();

		await this.usersRepository.updateUserEmailConfirmation(user.id, {
			code: confirmationCode,
			expiration: add(new Date(), { hours: 1 }).getTime(),
			isConfirmed: false,
		});

		try {
			await this.emailAdapter.sendEmail(user.email, confirmationCode);
		} catch (e) {
			throw new Error('Send email error');
		}
	}

	public async refreshToken(refreshToken: string): Promise<Tokens | void> {
		try {
			const jwtPayload = verify(refreshToken, SETTINGS.JWT_REFRESH_SECRET);

			if (typeof jwtPayload !== 'object') {
				return;
			}

			if (jwtPayload.expiration < new Date().getTime()) {
				console.log('Expiration is gone');
				return;
			}

			const user = await usersRepository.getUserByEmailOrLogin({ login: jwtPayload.login });

			if (!user || !user.refreshToken || refreshToken !== user.refreshToken) {
				return;
			}

			const { accessToken, refreshToken: newRefreshToken } = getTokens(user);

			await this.usersRepository.updateRefreshToken(user.id, newRefreshToken);

			return {
				refreshToken: newRefreshToken,
				accessToken,
			};
		} catch (e) {
			return;
		}
	}

	public async logout(refreshToken: string): Promise<boolean> {
		try {
			const jwtPayload = verify(refreshToken, SETTINGS.JWT_REFRESH_SECRET);

			if (typeof jwtPayload !== 'object') {
				return false;
			}

			if (jwtPayload.expiration < new Date().getTime()) {
				return false;
			}

			const user = await usersRepository.getUserByEmailOrLogin({ login: jwtPayload.login });

			if (!user || !user.refreshToken || refreshToken !== user.refreshToken) {
				return false;
			}

			return this.usersRepository.updateRefreshToken(user.id, '');
		} catch (e) {
			return false;
		}
	}
}

export const authService = new AuthService(usersRepository, emailAdapter);
