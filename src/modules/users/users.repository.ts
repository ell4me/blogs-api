import { EmailConfirmation, UserModel } from './users.dto';
import { usersCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';

export class UsersRepository {
	public async createUser(createdUser: UserModel): Promise<ObjectId> {
		const { insertedId } = await usersCollection.insertOne(createdUser);

		return insertedId;
	}

	public async deleteUserById(id: string): Promise<boolean> {
		const { deletedCount } = await usersCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	public deleteAllUsers(): Promise<DeleteResult> {
		return usersCollection.deleteMany({});
	}

	public getUserByEmailOrLogin({ email, login }: Partial<{
		email: string,
		login: string
	}>): Promise<UserModel | null> {
		return usersCollection.findOne({ $or: [{ email }, { login }] });
	}

	public getUserByConfirmationCode(code: string): Promise<UserModel | null> {
		return usersCollection.findOne({ 'emailConfirmation.code': code });
	}

	public async updateUserEmailConfirmation(id: string, emailConfirmation: EmailConfirmation): Promise<boolean> {
		const { modifiedCount } = await usersCollection.updateOne({ id }, { $set: { emailConfirmation } });

		return modifiedCount === 1;
	}

	public async updateRefreshToken(id: string, refreshToken: string): Promise<boolean> {
		const { modifiedCount } = await usersCollection.updateOne({ id }, { $set: { refreshToken } });

		return modifiedCount === 1;
	}
}

const usersRepository = new UsersRepository();

export { usersRepository };
