import { DeleteResult, ObjectId } from 'mongodb';
import { EmailConfirmation, PasswordRecovery, UserCreate } from './users.types';
import { UserDocument, UsersModel } from './users.model';
import { Model } from 'mongoose';

export class UsersRepository {
	constructor(private readonly UsersModel: Model<UserDocument>) {}

	async createUser(createdUser: UserCreate): Promise<ObjectId> {
		const { _id } = await this.UsersModel.create(createdUser);

		return _id;
	}

	async deleteUserById(id: string): Promise<boolean> {
		const result = await this.UsersModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllUsers(): Promise<DeleteResult> {
		return this.UsersModel.deleteMany().exec();
	}

	getUserByEmailOrLogin({
		email,
		login,
	}: Partial<{
		email: string;
		login: string;
	}>): Promise<UserDocument | null> {
		return this.UsersModel.findOne().or([{ email }, { login }]).exec();
	}

	getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
		return this.UsersModel.findOne({ 'emailConfirmation.code': code }).exec();
	}

	getUserByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
		return this.UsersModel.findOne({ 'passwordRecovery.code': code }).exec();
	}

	async updateUserEmailConfirmation(
		id: string,
		emailConfirmation: EmailConfirmation,
	): Promise<boolean> {
		const result = await this.UsersModel.findOneAndUpdate({ id }, { emailConfirmation });

		return !!result;
	}

	async updateUserPasswordRecovery(
		id: string,
		passwordRecovery: PasswordRecovery,
	): Promise<boolean> {
		const result = await this.UsersModel.findOneAndUpdate({ id }, { passwordRecovery });

		return !!result;
	}

	async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
		const result = await this.UsersModel.findOneAndUpdate({ id }, { password: newPassword });

		return !!result;
	}
}

const usersRepository = new UsersRepository(UsersModel);

export { usersRepository };
