import { usersCollection } from '../../helpers/runDb';
import { FilteredUserQueries, ItemsPaginationViewDto } from '../../types';
import { getUsersFilterRepository } from './helpers/getUsersFilterRepository';
import { UserModel, UserViewDto } from './users.dto';

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

		const users = await usersCollection.find(filter, { projection: { _id: false, password: false } })
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
		return usersCollection.findOne({ id }, { projection: { _id: false, password: false } });
	}

	public getUserByEmailOrLogin(email: string, login: string): Promise<UserModel | null> {
		return usersCollection.findOne({ $or: [{ email }, { login }] }, {
			projection: {
				_id: false,
			},
		});
	}

	public getCountUsersByFilter(searchLoginTerm: string | null, searchEmailTerm: string | null): Promise<number> {
		const filter = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);
		return usersCollection.countDocuments(filter);
	}
}

const usersQueryRepository = new UsersQueryRepository();

export { usersQueryRepository };
