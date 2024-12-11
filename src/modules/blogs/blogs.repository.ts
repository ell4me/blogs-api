import { BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { DeleteResult, ObjectId } from 'mongodb';
import { BlogsModel } from './blogs.model';
import { BlogCreate } from './blogs.types';

export class BlogsRepository {
	updateBlogById(id: string, newBlog: BlogUpdateDto): Promise<BlogViewDto | null> {
		return BlogsModel.findOneAndUpdate({ id }, newBlog, { returnDocument: 'before' }).exec();
	}

	async createBlog(createdBlog: BlogCreate): Promise<ObjectId> {
		const { _id } = await BlogsModel.create(createdBlog);

		return _id;
	}

	async deleteBlogById(id: string): Promise<boolean> {
		const result = await BlogsModel.findOneAndDelete({ id });

		return !!result;
	}

	deleteAllBlogs(): Promise<DeleteResult> {
		return BlogsModel.deleteMany().exec();
	}
}

const blogsRepository = new BlogsRepository();

export { blogsRepository };
