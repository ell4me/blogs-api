import { PostUpdateDto, PostViewDto } from './posts.dto';
import { postsCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';
import { BlogUpdateDto } from '../blogs/blogs.dto';

export class PostsRepository {
	async deleteAllPostsByBlogId(blogId: string): Promise<boolean> {
		const result = await postsCollection.deleteMany({ blogId });

		return !!result.deletedCount;
	}

	async updatePostById(id: string, newPost: PostUpdateDto): Promise<boolean> {
		const { modifiedCount } = await postsCollection.updateOne({ id }, { $set: newPost });

		return modifiedCount === 1;
	}

	async createPost(createdPost: PostViewDto): Promise<ObjectId> {
		const { insertedId } = await postsCollection.insertOne(createdPost);

		return insertedId;
	}

	async deletePostById(id: string): Promise<boolean> {
		const { deletedCount } = await postsCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	deleteAllPosts(): Promise<DeleteResult> {
		return postsCollection.deleteMany({});
	}

	async updatePostsByBlogId(id: string, { name }: Pick<BlogUpdateDto, 'name'>): Promise<boolean> {
		const { modifiedCount } = await postsCollection.updateMany(
			{ blogId: id },
			{ $set: { blogName: name } },
		);

		return !!modifiedCount;
	}
}

const postsRepository = new PostsRepository();

export { postsRepository };
