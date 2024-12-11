import { UserModel } from '../modules/users/users.dto';
import { VALIDATION_MESSAGES } from '../constants';

export const validateUserIsExist = (user: UserModel, currentEmail: string) => {
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
