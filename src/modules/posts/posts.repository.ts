import { PostUpdateDto } from './posts.dto';
import { DeleteResult, ObjectId } from 'mongodb';
import { BlogUpdateDto } from '../blogs/blogs.dto';
import { PostDocument, PostsModel } from './posts.model';
import { PostCreate } from './posts.types';
import { Model } from 'mongoose';

export class PostsRepository {
	constructor(private readonly PostsModel: Model<PostDocument>) {}

	async deleteAllPostsByBlogId(blogId: string): Promise<boolean> {
		const result = await this.PostsModel.deleteMany({ blogId });

		return !!result;
	}

	async updatePostById(id: string, newPost: PostUpdateDto): Promise<boolean> {
		const result = await this.PostsModel.findOneAndUpdate({ id }, newPost);

		return !!result;
	}

	async createPost(createdPost: PostCreate): Promise<ObjectId> {
		const { _id } = await this.PostsModel.create(createdPost);

		return _id;
	}

	async deletePostById(id: string): Promise<boolean> {
		const result = await this.PostsModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllPosts(): Promise<DeleteResult> {
		return this.PostsModel.deleteMany().exec();
	}

	async updatePostsByBlogId(id: string, { name }: Pick<BlogUpdateDto, 'name'>): Promise<boolean> {
		const result = await this.PostsModel.findOneAndUpdate({ blogId: id }, { blogName: name });

		return !!result;
	}
}

const postsRepository = new PostsRepository(PostsModel);

export { postsRepository };
