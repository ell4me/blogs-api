import { BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { DeleteResult, ObjectId } from 'mongodb';
import { BlogDocument, BlogsModel } from './blogs.model';
import { BlogCreate } from './blogs.types';
import { Model } from 'mongoose';

export class BlogsRepository {
	constructor(private readonly BlogsModel: Model<BlogDocument>) {}

	updateBlogById(id: string, newBlog: BlogUpdateDto): Promise<BlogViewDto | null> {
		return this.BlogsModel.findOneAndUpdate({ id }, newBlog, {
			returnDocument: 'before',
		}).exec();
	}

	async createBlog(createdBlog: BlogCreate): Promise<ObjectId> {
		const { _id } = await this.BlogsModel.create(createdBlog);

		return _id;
	}

	async deleteBlogById(id: string): Promise<boolean> {
		const result = await this.BlogsModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllBlogs(): Promise<DeleteResult> {
		return this.BlogsModel.deleteMany().exec();
	}
}

const blogsRepository = new BlogsRepository(BlogsModel);

export { blogsRepository };
