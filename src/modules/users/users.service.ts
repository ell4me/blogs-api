import { UsersRepository, usersRepository } from './users.repository';
import { UserCreateDto, UserModel } from './users.dto';
import { UsersQueryRepository, usersQueryRepository } from './users.query-repository';
import { ValidationErrorViewDto } from '../../types';
import { hash } from 'bcrypt';
import { validateUserIsExist } from '../../helpers/validateUserIsExist';

class UsersService {
	private usersRepository: UsersRepository;

	constructor(usersRepository: UsersRepository, usersQueryRepository: UsersQueryRepository) {
		this.usersRepository = usersRepository;
	}

	async createUser({ login, password, email }: UserCreateDto): Promise<{ id: string } | ValidationErrorViewDto> {
		const user = await this.usersRepository.getUserByEmailOrLogin(email, login);

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
}

export const usersService = new UsersService(usersRepository, usersQueryRepository);
