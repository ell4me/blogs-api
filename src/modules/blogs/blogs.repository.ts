import { BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { blogsCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';

export class BlogsRepository {
	updateBlogById(id: string, newBlog: BlogUpdateDto): Promise<BlogViewDto | null> {
		return blogsCollection.findOneAndUpdate(
			{ id },
			{ $set: newBlog },
			{ returnDocument: 'before' },
		);
	}

	async createBlog(createdBlog: BlogViewDto): Promise<ObjectId> {
		const { insertedId } = await blogsCollection.insertOne(createdBlog);

		return insertedId;
	}

	async deleteBlogById(id: string): Promise<boolean> {
		const { deletedCount } = await blogsCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	deleteAllBlogs(): Promise<DeleteResult> {
		return blogsCollection.deleteMany({});
	}
}

const blogsRepository = new BlogsRepository();

export { blogsRepository };
