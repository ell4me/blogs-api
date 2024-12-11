import { EmailConfirmation, UserModel } from './users.dto';
import { usersCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';

export class UsersRepository {
	async createUser(createdUser: UserModel): Promise<ObjectId> {
		const { insertedId } = await usersCollection.insertOne(createdUser);

		return insertedId;
	}

	async deleteUserById(id: string): Promise<boolean> {
		const { deletedCount } = await usersCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	deleteAllUsers(): Promise<DeleteResult> {
		return usersCollection.deleteMany({});
	}

	getUserByEmailOrLogin({
		email,
		login,
	}: Partial<{
		email: string;
		login: string;
	}>): Promise<UserModel | null> {
		return usersCollection.findOne({ $or: [{ email }, { login }] });
	}

	getUserByConfirmationCode(code: string): Promise<UserModel | null> {
		return usersCollection.findOne({ 'emailConfirmation.code': code });
	}

	async updateUserEmailConfirmation(
		id: string,
		emailConfirmation: EmailConfirmation,
	): Promise<boolean> {
		const { modifiedCount } = await usersCollection.updateOne(
			{ id },
			{ $set: { emailConfirmation } },
		);

		return modifiedCount === 1;
	}
}

const usersRepository = new UsersRepository();

export { usersRepository };
