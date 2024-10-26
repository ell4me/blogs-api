import { PostUpdateDto, PostModel } from './posts.dto';
import { postsCollection } from '../../helpers/runDb';
import { DeleteResult, MongoError } from 'mongodb';

export class PostsRepository {
	public getAllPosts(): Promise<PostModel[]> {
		return postsCollection.find({}, { projection: { _id: false } }).toArray();
	}

	public async deleteAllPostsByBlogId(blogId: string): Promise<boolean> {
		const result = await postsCollection.deleteMany({ blogId });

		return !!result.deletedCount;
	}

	public getPostById(id: string): Promise<PostModel | null> {
		return postsCollection.findOne({ id }, { projection: { _id: false } });
	}

	public async updatePostById(id: string, newPost: PostUpdateDto): Promise<boolean> {
		const { modifiedCount } = await postsCollection.updateOne({ id }, { $set: newPost });

		return modifiedCount === 1;
	}

	public async createPost(createdPost: PostModel): Promise<PostModel> {
		await postsCollection.insertOne(createdPost);
		const currentPost = await this.getPostById(createdPost.id);

		if (!currentPost) {
			throw new MongoError('The blog was not be created');
		}

		return currentPost;
	}

	public async deletePostById(id: string): Promise<boolean> {
		const { deletedCount } = await postsCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	public deleteAllPosts(): Promise<DeleteResult> {
		return postsCollection.deleteMany({});
	}
}

const postsRepository = new PostsRepository();

export { postsRepository };
