import { injectable } from 'inversify';
import { BlogViewDto } from './blogs.dto';
import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';
import { BlogsModel } from './blogs.model';

@injectable()
export class BlogsQueryRepository {
	async getAllBlogs({
		pageSize,
		pageNumber,
		sortBy,
		sortDirection,
		searchNameTerm,
	}: FilteredBlogQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
		const blogsQuery = BlogsModel.find();

		if (searchNameTerm) {
			blogsQuery.where('name').regex(new RegExp(searchNameTerm, 'i'));
		}

		const blogs = await blogsQuery
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-_id -__v -updatedAt');

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
		return BlogsModel.findOne({ id }).select('-_id -__v -updatedAt').exec();
	}

	getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
		const blogsCountQuery = BlogsModel.countDocuments();

		if (searchNameTerm) {
			blogsCountQuery.where('name').regex(new RegExp(searchNameTerm, 'i'));
		}

		return blogsCountQuery.exec();
	}
}
