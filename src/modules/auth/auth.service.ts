import { AuthLoginDto } from './auth.dto';
import { UsersQueryRepository, usersQueryRepository } from '../users/users.query-repository';
import { compare } from 'bcrypt';

class AuthService {
	private usersQueryRepository: UsersQueryRepository;

	constructor(usersQueryRepository: UsersQueryRepository) {
		this.usersQueryRepository = usersQueryRepository;
	}

	public async login({ loginOrEmail, password }: AuthLoginDto): Promise<boolean> {
		const user = await this.usersQueryRepository.getUserByEmailOrLogin(loginOrEmail, loginOrEmail);

		if (!user) {
			return false;
		}

		return compare(password, user.password);
	}
}

export const authService = new AuthService(usersQueryRepository);
