import { usersCollection } from '../../helpers/runDb';
import { CurrentUserViewDto } from './auth.dto';

export class AuthQueryRepository {
	public async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
		const user = await usersCollection.findOne({ id }, { projection: { _id: false } });

		return {
			email: user!.email,
			login: user!.login,
			userId: user!.id,
		};
	}
}

const authQueryRepository = new AuthQueryRepository();

export { authQueryRepository };
