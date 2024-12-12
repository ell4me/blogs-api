import { UsersRepository, usersRepository } from './users.repository';
import { ValidationErrorViewDto } from '../../types';
import { hash } from 'bcrypt';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';
import { ObjectId } from 'mongodb';
import { EmailConfirmation, PasswordRecovery, UserCreate } from './users.types';
import { UserCreateDto } from './users.dto';
import { UserDocument } from './users.model';

export class UsersService {
	private usersRepository: UsersRepository;

	constructor(usersRepository: UsersRepository) {
		this.usersRepository = usersRepository;
	}

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

	updateUserPasswordRecovery(
		id: string,
		passwordRecovery: PasswordRecovery,
	): Promise<boolean> {
		return this.usersRepository.updateUserPasswordRecovery(id, passwordRecovery);
	}

	updateUserPassword(
		id: string,
		newPassword: string,
	): Promise<boolean> {
		return this.usersRepository.updateUserPassword(id, newPassword);
	}

	getUserByEmailOrLogin(
		emailOrLogin: Partial<{
			email: string;
			login: string;
		}>,
	): Promise<UserDocument | null> {
		return this.usersRepository.getUserByEmailOrLogin(emailOrLogin);
	}

	getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
		return usersRepository.getUserByConfirmationCode(code);
	}

	getUserByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
		return usersRepository.getUserByPasswordRecoveryCode(code);
	}
}

export const usersService = new UsersService(usersRepository);
