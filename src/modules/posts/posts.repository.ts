import { DeleteResult } from 'mongodb';
import { BlogUpdateDto } from '../blogs/blogs.dto';
import { PostDocument, PostsModel } from './posts.model';
import { injectable } from 'inversify';
import { PostCreateByBlogIdDto } from './posts.dto';

@injectable()
export class PostsRepository {
	async getById(id: string): Promise<PostDocument | null> {
		return PostsModel.findOne({ id });
	}

	async deleteAllByBlogId(blogId: string): Promise<boolean> {
		const result = await PostsModel.deleteMany({ blogId });

		return !!result;
	}

	async save(post: PostDocument): Promise<PostDocument> {
		return post.save();
	}

	async deleteById(id: string): Promise<boolean> {
		const result = await PostsModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAll(): Promise<DeleteResult> {
		return PostsModel.deleteMany();
	}

	async updateByBlogId(id: string, { name }: Pick<BlogUpdateDto, 'name'>): Promise<boolean> {
		const result = await PostsModel.findOneAndUpdate({ blogId: id }, { blogName: name });

		return !!result;
	}

	async create(newPost: PostCreateByBlogIdDto, blogName: string): Promise<PostDocument> {
		const post = PostsModel.getInstance(newPost, blogName, PostsModel);
		return await post.save();
	}
}
