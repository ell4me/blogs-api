import { DeleteResult, ObjectId } from 'mongodb';
import { EmailConfirmation, PasswordRecovery, UserCreate } from './users.types';
import { UserDocument, UsersModel } from './users.model';
import { injectable } from 'inversify';

@injectable()
export class UsersRepository {
	async createUser(createdUser: UserCreate): Promise<ObjectId> {
		const { _id } = await UsersModel.create(createdUser);

		return _id;
	}

	async deleteUserById(id: string): Promise<boolean> {
		const result = await UsersModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllUsers(): Promise<DeleteResult> {
		return UsersModel.deleteMany().exec();
	}

	getUserByEmailOrLogin({
		email,
		login,
	}: Partial<{
		email: string;
		login: string;
	}>): Promise<UserDocument | null> {
		return UsersModel.findOne().or([{ email }, { login }]).exec();
	}

	getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
		return UsersModel.findOne({ 'emailConfirmation.code': code }).exec();
	}

	getUserByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
		return UsersModel.findOne({ 'passwordRecovery.code': code }).exec();
	}

	async updateUserEmailConfirmation(
		id: string,
		emailConfirmation: EmailConfirmation,
	): Promise<boolean> {
		const result = await UsersModel.findOneAndUpdate({ id }, { emailConfirmation });

		return !!result;
	}

	async updateUserPasswordRecovery(
		id: string,
		passwordRecovery: PasswordRecovery,
	): Promise<boolean> {
		const result = await UsersModel.findOneAndUpdate({ id }, { passwordRecovery });

		return !!result;
	}

	async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
		const result = await UsersModel.findOneAndUpdate({ id }, { password: newPassword });

		return !!result;
	}
}
