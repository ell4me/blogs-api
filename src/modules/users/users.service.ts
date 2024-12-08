import { UsersRepository, usersRepository } from './users.repository';
import { EmailConfirmation, UserCreateDto, UserModel } from './users.dto';
import { ValidationErrorViewDto } from '../../types';
import { hash } from 'bcrypt';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';
import { ObjectId } from 'mongodb';

export class UsersService {
	private usersRepository: UsersRepository;

	constructor(usersRepository: UsersRepository) {
		this.usersRepository = usersRepository;
	}

	createUserRegistration(createdUser: UserModel): Promise<ObjectId> {
		return this.usersRepository.createUser(createdUser);
	}

	async createUser({ login, password, email }: UserCreateDto): Promise<{ id: string } | ValidationErrorViewDto> {
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

	updateUserEmailConfirmation(id: string, emailConfirmation: EmailConfirmation): Promise<boolean> {
		return this.usersRepository.updateUserEmailConfirmation(id, emailConfirmation);
	}

	getUserByEmailOrLogin(emailOrLogin: Partial<{
		email: string,
		login: string
	}>): Promise<UserModel | null> {
		return this.usersRepository.getUserByEmailOrLogin(emailOrLogin);
	}

	getUserByConfirmationCode(code: string): Promise<UserModel | null> {
		return usersRepository.getUserByConfirmationCode(code);
	}
}

export const usersService = new UsersService(usersRepository);
