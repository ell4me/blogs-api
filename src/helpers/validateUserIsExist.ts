import { VALIDATION_MESSAGES } from '../constants';
import { User } from '../modules/users/users.model';

export const validateUserIsExist = (user: User, currentEmail: string) => {
	if (currentEmail === user.email) {
		return {
			errorsMessages: [
				{ field: 'email', message: VALIDATION_MESSAGES.FIELD_IS_EXIST('email') },
			],
		};
	}

	return {
		errorsMessages: [{ field: 'login', message: VALIDATION_MESSAGES.FIELD_IS_EXIST('login') }],
	};
};
