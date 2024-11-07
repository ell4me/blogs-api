import { Collection, MongoClient } from 'mongodb';
import { COLLECTION_NAMES, SETTINGS } from '../constants';
import { BlogViewDto } from '../modules/blogs/blogs.dto';
import { PostViewDto } from '../modules/posts/posts.dto';
import { UserModel } from '../modules/users/users.dto';

export let blogsCollection: Collection<BlogViewDto>;
export let postsCollection: Collection<PostViewDto>;
export let usersCollection: Collection<UserModel>;

export const runDb = async (clientDb: MongoClient) => {
	try {
		await clientDb.connect();
		const db = clientDb.db(SETTINGS.DB_NAME);
		await db.command({ ping: 1 });

		blogsCollection = db.collection(COLLECTION_NAMES.BLOGS);
		postsCollection = db.collection(COLLECTION_NAMES.POSTS);
		usersCollection = db.collection(COLLECTION_NAMES.USERS);
	} catch (e) {
		await clientDb.close();
	}
};
