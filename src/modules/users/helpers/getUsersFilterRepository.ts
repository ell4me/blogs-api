export const getUsersFilterRepository = (
	searchLoginTerm: string | null,
	searchEmailTerm: string | null,
) => {
	let filter = [];

	if (searchLoginTerm) {
		filter.push({
			login: {
				$regex: searchLoginTerm,
				$options: 'i',
			},
		});
	}

	if (searchEmailTerm) {
		filter.push({
			email: {
				$regex: searchEmailTerm,
				$options: 'i',
			},
		});
	}

	return filter;
};
