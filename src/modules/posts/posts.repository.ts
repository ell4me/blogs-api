import { DeleteResult } from 'mongodb';
import { BlogUpdateDto } from '../blogs/blogs.dto';
import { HydratedPostDocument, PostsModel } from './posts.model';
import { injectable } from 'inversify';

@injectable()
export class PostsRepository {
	async getPostById(id: string): Promise<HydratedPostDocument | null> {
		return PostsModel.findOne({ id });
	}

	async deleteAllPostsByBlogId(blogId: string): Promise<boolean> {
		const result = await PostsModel.deleteMany({ blogId });

		return !!result;
	}

	async save(post: HydratedPostDocument): Promise<HydratedPostDocument> {
		return post.save();
	}

	async deletePostById(id: string): Promise<boolean> {
		const result = await PostsModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllPosts(): Promise<DeleteResult> {
		return PostsModel.deleteMany();
	}

	async updatePostsByBlogId(id: string, { name }: Pick<BlogUpdateDto, 'name'>): Promise<boolean> {
		const result = await PostsModel.findOneAndUpdate({ blogId: id }, { blogName: name });

		return !!result;
	}
}
