import { usersCollection } from '../../helpers/runDb';
import { FilteredUserQueries, ItemsPaginationViewDto } from '../../types';
import { getUsersFilterRepository } from './helpers/getUsersFilterRepository';
import { UserViewDto } from './users.dto';
import { CurrentUserViewDto } from '../auth/auth.dto';

export class UsersQueryRepository {
	public async getAllUsers({
								 pageSize,
								 pageNumber,
								 sortBy,
								 sortDirection,
								 searchLoginTerm,
								 searchEmailTerm,
							 }: FilteredUserQueries): Promise<ItemsPaginationViewDto<UserViewDto>> {
		const filter = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);

		const users = await usersCollection.find(filter, {
			projection: {
				_id: false,
				password: false,
				emailConfirmation: false,
				refreshToken: false,
			},
		})
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.toArray();

		const totalCount = await this.getCountUsersByFilter(searchLoginTerm, searchEmailTerm);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(totalCount / pageSize),
			pageSize,
			totalCount,
			items: users,
		};
	}

	public getUserById(id: string): Promise<UserViewDto | null> {
		return usersCollection.findOne({ id }, {
			projection: {
				_id: false,
				password: false,
				emailConfirmation: false,
				refreshToken: false,
			},
		});
	}

	public getCountUsersByFilter(searchLoginTerm: string | null, searchEmailTerm: string | null): Promise<number> {
		const filter = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);
		return usersCollection.countDocuments(filter);
	}

	public async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
		const user = await usersCollection.findOne({ id });

		return {
			email: user!.email,
			login: user!.login,
			userId: user!.id,
		};
	}
}

const usersQueryRepository = new UsersQueryRepository();

export { usersQueryRepository };
