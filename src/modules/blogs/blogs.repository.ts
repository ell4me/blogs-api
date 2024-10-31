import { BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { blogsCollection } from '../../helpers/runDb';
import { DeleteResult, Filter, MongoError } from 'mongodb';
import { FilteredQueries } from '../../types';

export class BlogsRepository {
	public getAllBlogs({
						   pageSize,
						   pageNumber,
						   sortBy,
						   sortDirection,
						   searchNameTerm,
					   }: FilteredQueries): Promise<BlogViewDto[]> {
		let filter: Filter<BlogViewDto> = {};

		if (searchNameTerm) {
			filter = { name: new RegExp(searchNameTerm, 'i') };
		}

		return blogsCollection.find(filter, { projection: { _id: false } })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.toArray();
	}

	public getBlogById(id: string): Promise<BlogViewDto | null> {
		return blogsCollection.findOne({ id }, { projection: { _id: false } });
	}

	public updateBlogById(id: string, newBlog: BlogUpdateDto): Promise<BlogViewDto | null> {
		return blogsCollection.findOneAndUpdate({ id }, { $set: newBlog }, {returnDocument: 'before'});
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

	public getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
		let filter: Filter<BlogViewDto> = {};

		if (searchNameTerm) {
			filter = { name: new RegExp(searchNameTerm, 'i') };
		}

		return blogsCollection.countDocuments(filter);
	}
}

const blogsRepository = new BlogsRepository();

export { blogsRepository };
