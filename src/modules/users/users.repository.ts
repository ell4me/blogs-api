import { UserModel } from './users.dto';
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
}

const usersRepository = new UsersRepository();

export { usersRepository };
