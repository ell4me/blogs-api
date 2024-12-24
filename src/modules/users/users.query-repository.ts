import { injectable } from 'inversify';
import { FilteredUserQueries, ItemsPaginationViewDto } from '../../types';
import { getUsersFilterRepository } from './helpers/getUsersFilterRepository';
import { UserViewDto } from './users.dto';
import { CurrentUserViewDto } from '../auth/auth.dto';
import { UsersModel } from './users.model';

@injectable()
export class UsersQueryRepository {
	async getAllUsers({
		pageSize,
		pageNumber,
		sortBy,
		sortDirection,
		searchLoginTerm,
		searchEmailTerm,
	}: FilteredUserQueries): Promise<ItemsPaginationViewDto<UserViewDto>> {
		const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);

		const users = await UsersModel.find()
			.or(filterOr)
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-_id -__v -updatedAt -password -emailConfirmation -passwordRecovery');

		const totalCount = await this.getCountUsersByFilter(searchLoginTerm, searchEmailTerm);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(totalCount / pageSize),
			pageSize,
			totalCount,
			items: users,
		};
	}

	getUserById(id: string): Promise<UserViewDto | null> {
		return UsersModel.findOne({ id })
			.select('-_id -__v -updatedAt -password -emailConfirmation -passwordRecovery')
			.exec();
	}

	getCountUsersByFilter(
		searchLoginTerm: string | null,
		searchEmailTerm: string | null,
	): Promise<number> {
		const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);
		return UsersModel.countDocuments().or(filterOr).exec();
	}

	async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
		const user = await UsersModel.findOne({ id });

		return {
			email: user!.email,
			login: user!.login,
			userId: user!.id,
		};
	}
}
