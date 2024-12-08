import { BlogViewDto } from './blogs.dto';
import { blogsCollection } from '../../helpers/runDb';
import { Filter } from 'mongodb';
import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';

export class BlogsQueryRepository {
	async getAllBlogs({
						   pageSize,
						   pageNumber,
						   sortBy,
						   sortDirection,
						   searchNameTerm,
					   }: FilteredBlogQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
		let filter: Filter<BlogViewDto> = {};

		if (searchNameTerm) {
			filter = { name: new RegExp(searchNameTerm, 'i') };
		}

		const blogs = await blogsCollection.find(filter, { projection: { _id: false } })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.toArray();

		const totalCount = await this.getCountBlogsByFilter(searchNameTerm);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(totalCount / pageSize),
			pageSize,
			totalCount,
			items: blogs,
		};
	}

	getBlogById(id: string): Promise<BlogViewDto | null> {
		return blogsCollection.findOne({ id }, { projection: { _id: false } });
	}

	getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
		let filter: Filter<BlogViewDto> = {};

		if (searchNameTerm) {
			filter = { name: new RegExp(searchNameTerm, 'i') };
		}

		return blogsCollection.countDocuments(filter);
	}
}

const blogsQueryRepository = new BlogsQueryRepository();

export { blogsQueryRepository };
