import { PostUpdateDto, PostViewDto } from './posts.dto';
import { postsCollection } from '../../helpers/runDb';
import { DeleteResult, Filter, MongoError } from 'mongodb';
import { FilteredQueries } from '../../types';
import { BlogUpdateDto } from '../blogs/blogs.dto';

export class PostsRepository {
	public getAllPosts({
						   pageSize,
						   pageNumber,
						   sortBy,
						   sortDirection,
					   }: FilteredQueries, additionalFilter?: Filter<PostViewDto>): Promise<PostViewDto[]> {
		return postsCollection.find(additionalFilter ? additionalFilter : {}, { projection: { _id: false } })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.toArray();
	}

	public async deleteAllPostsByBlogId(blogId: string): Promise<boolean> {
		const result = await postsCollection.deleteMany({ blogId });

		return !!result.deletedCount;
	}

	public getPostById(id: string): Promise<PostViewDto | null> {
		return postsCollection.findOne({ id }, { projection: { _id: false } });
	}

	public async updatePostById(id: string, newPost: PostUpdateDto): Promise<boolean> {
		const { modifiedCount } = await postsCollection.updateOne({ id }, { $set: newPost });

		return modifiedCount === 1;
	}

	public async createPost(createdPost: PostViewDto): Promise<PostViewDto> {
		await postsCollection.insertOne(createdPost);
		const currentPost = await this.getPostById(createdPost.id);

		if (!currentPost) {
			throw new MongoError('The post was not be created');
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

	public getCountPosts(filter?: Filter<PostViewDto>): Promise<number> {
		return postsCollection.countDocuments(filter ? filter : {});
	}

	public async updatePostsByBlogId(id: string, { name }: Pick<BlogUpdateDto, 'name'>): Promise<boolean> {
		const { modifiedCount } = await postsCollection.updateMany({ blogId: id }, { $set: { blogName: name } });

		return !!modifiedCount;
	}
}

const postsRepository = new PostsRepository();

export { postsRepository };
