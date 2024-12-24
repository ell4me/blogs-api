import { PostViewDto } from './posts.dto';
import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';
import { PostsModel } from './posts.model';
import { injectable } from 'inversify';

@injectable()
export class PostsQueryRepository {
	async getAllPosts(
		{ pageSize, pageNumber, sortBy, sortDirection, searchNameTerm }: FilteredBlogQueries,
		additionalFilter?: { blogId?: string },
	): Promise<ItemsPaginationViewDto<PostViewDto>> {
		const postsQuery = PostsModel.find();

		if (searchNameTerm) {
			postsQuery.where('title').regex(RegExp(searchNameTerm, 'i'));
		}

		if (additionalFilter?.blogId) {
			postsQuery.where('blogId', additionalFilter.blogId);
		}

		const posts = await postsQuery
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-__v -_id -updatedAt');

		const postsCountByFilter = await this.getCountPosts(additionalFilter);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(postsCountByFilter / pageSize),
			pageSize,
			totalCount: postsCountByFilter,
			items: posts,
		};
	}

	getPostById(id: string): Promise<PostViewDto | null> {
		return PostsModel.findOne({ id }).select('-__v -_id -updatedAt').exec();
	}

	getCountPosts(filter?: { blogId?: string }): Promise<number> {
		const postsQueryCount = PostsModel.countDocuments();

		if (filter?.blogId) {
			postsQueryCount.where('blogId', filter.blogId);
		}

		return postsQueryCount.exec();
	}
}
