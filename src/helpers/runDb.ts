import { Collection, MongoClient } from 'mongodb';
import { COLLECTION_NAMES, SETTINGS } from '../constants';
import { BlogViewDto } from '../modules/blogs/blogs.dto';
import { PostModel } from '../modules/posts/posts.dto';

export let blogsCollection: Collection<BlogViewDto>;
export let postsCollection: Collection<PostModel>;

export const runDb = async (clientDb: MongoClient) => {
	try {
		await clientDb.connect();
		const db = clientDb.db(SETTINGS.DB_NAME);
		await db.command({ ping: 1 });

		blogsCollection = db.collection(COLLECTION_NAMES.BLOGS);
		postsCollection = db.collection(COLLECTION_NAMES.POSTS);
	} catch (e) {
		await clientDb.close();
	}
};
