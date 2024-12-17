import { BlogViewDto } from './blogs.dto';
import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';
import { Model } from 'mongoose';
import { BlogDocument, BlogsModel } from './blogs.model';

export class BlogsQueryRepository {
	constructor(private readonly BlogsModel: Model<BlogDocument>) {}

	async getAllBlogs({
		pageSize,
		pageNumber,
		sortBy,
		sortDirection,
		searchNameTerm,
	}: FilteredBlogQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
		const blogsQuery = this.BlogsModel.find();

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
		return this.BlogsModel.findOne({ id }).select('-_id -__v -updatedAt').exec();
	}

	getCountBlogsByFilter(searchNameTerm: string | null): Promise<number> {
		const blogsCountQuery = this.BlogsModel.countDocuments();

		if (searchNameTerm) {
			blogsCountQuery.where('name').regex(new RegExp(searchNameTerm, 'i'));
		}

		return blogsCountQuery.exec();
	}
}

const blogsQueryRepository = new BlogsQueryRepository(BlogsModel);

export { blogsQueryRepository };
