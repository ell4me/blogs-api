import { FilteredUserQueries, ItemsPaginationViewDto } from '../../types';
import { getUsersFilterRepository } from './helpers/getUsersFilterRepository';
import { UserViewDto } from './users.dto';
import { CurrentUserViewDto } from '../auth/auth.dto';
import { UserDocument, UsersModel } from './users.model';
import { Model } from 'mongoose';

export class UsersQueryRepository {
	constructor(private readonly UsersModel: Model<UserDocument>) {}

	async getAllUsers({
		pageSize,
		pageNumber,
		sortBy,
		sortDirection,
		searchLoginTerm,
		searchEmailTerm,
	}: FilteredUserQueries): Promise<ItemsPaginationViewDto<UserViewDto>> {
		const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);

		const users = await this.UsersModel.find()
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
		return this.UsersModel.findOne({ id })
			.select('-_id -__v -updatedAt -password -emailConfirmation -passwordRecovery')
			.exec();
	}

	getCountUsersByFilter(
		searchLoginTerm: string | null,
		searchEmailTerm: string | null,
	): Promise<number> {
		const filterOr = getUsersFilterRepository(searchLoginTerm, searchEmailTerm);
		return this.UsersModel.countDocuments().or(filterOr).exec();
	}

	async getCurrentUser(id: string): Promise<CurrentUserViewDto> {
		const user = await this.UsersModel.findOne({ id });

		return {
			email: user!.email,
			login: user!.login,
			userId: user!.id,
		};
	}
}

const usersQueryRepository = new UsersQueryRepository(UsersModel);

export { usersQueryRepository };
