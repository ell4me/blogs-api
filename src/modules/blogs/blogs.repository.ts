import { BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { blogsCollection } from '../../helpers/runDb';
import { DeleteResult, MongoError } from 'mongodb';

export class BlogsRepository {
	public getAllBlogs(): Promise<BlogViewDto[]> {
		return blogsCollection.find({}, { projection: { _id: false } }).toArray();
	}

	public getBlogById(id: string): Promise<BlogViewDto | null> {
		return blogsCollection.findOne({ id }, { projection: { _id: false } });
	}

	public async updateBlogById(id: string, newBlog: BlogUpdateDto): Promise<boolean> {
		const { modifiedCount } = await blogsCollection.updateOne({ id }, { $set: newBlog });

		return modifiedCount === 1;
	}

	public async createBlog(createdBlog: BlogViewDto): Promise<BlogViewDto> {
		await blogsCollection.insertOne(createdBlog);
		const currentBlog = await this.getBlogById(createdBlog.id);

		if (!currentBlog) {
			throw new MongoError('The blog was not be created');
		}

		return currentBlog;
	}

	public async deleteBlogById(id: string): Promise<boolean> {
		const { deletedCount } = await blogsCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	public deleteAllBlogs(): Promise<DeleteResult> {
		return blogsCollection.deleteMany({});
	}
}

const blogsRepository = new BlogsRepository();

export { blogsRepository };
