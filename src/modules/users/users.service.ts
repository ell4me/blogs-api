import { UsersRepository, usersRepository } from './users.repository';
import { UserCreateDto, UserModel } from './users.dto';
import { UsersQueryRepository, usersQueryRepository } from './users.query-repository';
import { ValidationErrorViewDto } from '../../types';
import { hash } from 'bcrypt';
import { VALIDATION_MESSAGES } from '../../constants';

class UsersService {
	private usersRepository: UsersRepository;
	private usersQueryRepository: UsersQueryRepository;

	constructor(usersRepository: UsersRepository, usersQueryRepository: UsersQueryRepository) {
		this.usersRepository = usersRepository;
		this.usersQueryRepository = usersQueryRepository;
	}

	async createUser({ login, password, email }: UserCreateDto): Promise<{ id: string } | ValidationErrorViewDto> {
		const user = await this.usersQueryRepository.getUserByEmailOrLogin(email, login);

		if (user) {
			if (email === user.email) {
				return { errorsMessages: [{ field: 'email', message: VALIDATION_MESSAGES.FIELD_IS_EXIST('email') }] };
			}

			return { errorsMessages: [{ field: 'login', message: VALIDATION_MESSAGES.FIELD_IS_EXIST('login') }] };
		}

		const id = new Date().getTime().toString();
		const passwordHash = await hash(password, 10);

		const createdUser: UserModel = {
			id,
			login,
			email,
			password: passwordHash,
			createdAt: new Date().toISOString(),
		};

		await this.usersRepository.createUser(createdUser);

		return { id };
	}

	deleteUserById(id: string): Promise<boolean> {
		return this.usersRepository.deleteUserById(id);
	}
}

export const usersService = new UsersService(usersRepository, usersQueryRepository);
