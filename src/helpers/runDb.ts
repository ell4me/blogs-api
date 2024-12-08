import { Collection, MongoClient } from 'mongodb';
import { COLLECTION_NAMES, SETTINGS } from '../constants';
import { BlogViewDto } from '../modules/blogs/blogs.dto';
import { PostViewDto } from '../modules/posts/posts.dto';
import { UserModel } from '../modules/users/users.dto';
import { CommentModel } from '../modules/comments/comments.dto';
import { RateLimitModel } from '../modules/rateLimit/rateLimit.model';
import { SecurityDevicesModel } from '../modules/securityDevices/securityDevices.dto';

export let blogsCollection: Collection<BlogViewDto>;
export let postsCollection: Collection<PostViewDto>;
export let usersCollection: Collection<UserModel>;
export let commentsCollection: Collection<CommentModel>;
export let rateLimitCollection: Collection<RateLimitModel>;
export let securityDevicesCollection: Collection<SecurityDevicesModel>;

export const runDb = async (clientDb: MongoClient) => {
	try {
		await clientDb.connect();
		const db = clientDb.db(SETTINGS.DB_NAME);
		await db.command({ ping: 1 });

		blogsCollection = db.collection(COLLECTION_NAMES.BLOGS);
		postsCollection = db.collection(COLLECTION_NAMES.POSTS);
		usersCollection = db.collection(COLLECTION_NAMES.USERS);
		commentsCollection = db.collection(COLLECTION_NAMES.COMMENTS);
		rateLimitCollection = db.collection(COLLECTION_NAMES.RATE_LIMIT);
		securityDevicesCollection = db.collection(COLLECTION_NAMES.SECURITY_DEVICES);
	} catch (e) {
		await clientDb.close();
	}
};
