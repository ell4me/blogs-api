import { inject, injectable } from 'inversify';
import { UsersRepository } from './users.repository';
import { ValidationErrorViewDto } from '../../types';
import { hash } from 'bcrypt';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';
import { ObjectId } from 'mongodb';
import { EmailConfirmation, PasswordRecovery, UserCreate } from './users.types';
import { UserCreateDto } from './users.dto';
import { User } from './users.model';

@injectable()
export class UsersService {
	constructor(@inject(UsersRepository) private readonly usersRepository: UsersRepository) {}

	createUserRegistration(createdUser: UserCreate): Promise<ObjectId> {
		return this.usersRepository.createUser(createdUser);
	}

	async createUser({
		login,
		password,
		email,
	}: UserCreateDto): Promise<{ id: string } | ValidationErrorViewDto> {
		const user = await this.usersRepository.getUserByEmailOrLogin({ email, login });

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
				isConfirmed: true,
				code: '',
				expiration: new Date().getTime(),
			},
		};

		await this.usersRepository.createUser(createdUser);

		return { id };
	}

	deleteUserById(id: string): Promise<boolean> {
		return this.usersRepository.deleteUserById(id);
	}

	updateUserEmailConfirmation(
		id: string,
		emailConfirmation: EmailConfirmation,
	): Promise<boolean> {
		return this.usersRepository.updateUserEmailConfirmation(id, emailConfirmation);
	}

	updateUserPasswordRecovery(id: string, passwordRecovery: PasswordRecovery): Promise<boolean> {
		return this.usersRepository.updateUserPasswordRecovery(id, passwordRecovery);
	}

	updateUserPassword(id: string, newPassword: string): Promise<boolean> {
		return this.usersRepository.updateUserPassword(id, newPassword);
	}

	getUserByEmailOrLogin(
		emailOrLogin: Partial<{
			email: string;
			login: string;
		}>,
	): Promise<User | null> {
		return this.usersRepository.getUserByEmailOrLogin(emailOrLogin);
	}

	getUserByConfirmationCode(code: string): Promise<User | null> {
		return this.usersRepository.getUserByConfirmationCode(code);
	}

	getUserByPasswordRecoveryCode(code: string): Promise<User | null> {
		return this.usersRepository.getUserByPasswordRecoveryCode(code);
	}
}
