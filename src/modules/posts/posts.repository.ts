import { PostUpdateDto } from './posts.dto';
import { DeleteResult, ObjectId } from 'mongodb';
import { BlogUpdateDto } from '../blogs/blogs.dto';
import { PostsModel } from './posts.model';
import { PostCreate } from './posts.types';
import { injectable } from 'inversify';

@injectable()
export class PostsRepository {
	async deleteAllPostsByBlogId(blogId: string): Promise<boolean> {
		const result = await PostsModel.deleteMany({ blogId });

		return !!result;
	}

	async updatePostById(id: string, newPost: PostUpdateDto): Promise<boolean> {
		const result = await PostsModel.findOneAndUpdate({ id }, newPost);

		return !!result;
	}

	async createPost(createdPost: PostCreate): Promise<ObjectId> {
		const { _id } = await PostsModel.create(createdPost);

		return _id;
	}

	async deletePostById(id: string): Promise<boolean> {
		const result = await PostsModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllPosts(): Promise<DeleteResult> {
		return PostsModel.deleteMany().exec();
	}

	async updatePostsByBlogId(id: string, { name }: Pick<BlogUpdateDto, 'name'>): Promise<boolean> {
		const result = await PostsModel.findOneAndUpdate({ blogId: id }, { blogName: name });

		return !!result;
	}
}
