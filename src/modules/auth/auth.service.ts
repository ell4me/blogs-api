import { AuthLoginDto } from './auth.dto';
import { UsersQueryRepository, usersQueryRepository } from '../users/users.query-repository';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SETTINGS } from '../../constants';

class AuthService {
	private usersQueryRepository: UsersQueryRepository;

	constructor(usersQueryRepository: UsersQueryRepository) {
		this.usersQueryRepository = usersQueryRepository;
	}

	public async login({ loginOrEmail, password }: AuthLoginDto): Promise<boolean | { accessToken: string }> {
		const user = await this.usersQueryRepository.getUserByEmailOrLogin(loginOrEmail, loginOrEmail);

		if (!user) {
			return false;
		}

		const isCorrectPassword = await compare(password, user.password);

		if (!isCorrectPassword) {
			return false;
		}

		return { accessToken: sign({ userId: user.id }, SETTINGS.JWT_SECRET) };
	}
}

export const authService = new AuthService(usersQueryRepository);
