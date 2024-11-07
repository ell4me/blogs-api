import { Filter } from 'mongodb';
import { UserViewDto } from '../users.dto';

export const getUsersFilterRepository = (searchLoginTerm: string | null, searchEmailTerm: string | null) => {
	let filter: Filter<UserViewDto> = {};

	if (searchLoginTerm || searchEmailTerm) {
		filter = { $or: [] };
	}

	if (searchLoginTerm) {
		filter.$or?.push({
			login: {
				$regex: searchLoginTerm,
				$options: 'i',
			},
		});
	}

	if (searchEmailTerm) {
		filter.$or?.push({
			email: {
				$regex: searchEmailTerm,
				$options: 'i',
			},
		});
	}

	return filter;
};