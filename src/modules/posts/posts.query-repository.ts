import { PostViewDto } from './posts.dto';
import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';
import { PostDocument, PostsModel } from './posts.model';
import { inject, injectable } from 'inversify';
import { LikesPostQueryRepository } from '../likesPost/likesPost.query-repository';

@injectable()
export class PostsQueryRepository {
	constructor(
		@inject(LikesPostQueryRepository)
		private readonly likesPostQueryRepository: LikesPostQueryRepository,
	) {}

	async getAllPosts(
		{ pageSize, pageNumber, sortBy, sortDirection, searchNameTerm }: FilteredBlogQueries,
		userId?: string,
		additionalFilter?: { blogId?: string },
	): Promise<ItemsPaginationViewDto<PostViewDto>> {
		const postsQuery = PostsModel.find();

		if (searchNameTerm) {
			postsQuery.where('title').regex(RegExp(searchNameTerm, 'i'));
		}

		if (additionalFilter?.blogId) {
			postsQuery.where('blogId', additionalFilter.blogId);
		}

		const posts: PostDocument[] = await postsQuery
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-__v -_id -updatedAt')
			.lean();

		const postIds = posts.map(({ id }) => id);
		const likesByPostIds = await this.likesPostQueryRepository.getLikesByPostIds(
			postIds,
			userId,
		);

		const postsCountByFilter = await this.getCountPosts(additionalFilter);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(postsCountByFilter / pageSize),
			pageSize,
			totalCount: postsCountByFilter,
			items: posts.map(post => ({
				...post,
				extendedLikesInfo: likesByPostIds[post.id],
			})),
		};
	}

	async getPostById(postId: string, userId?: string): Promise<PostViewDto | null> {
		const post: PostDocument | null = await PostsModel.findOne({ id: postId })
			.select('-__v -_id -updatedAt')
			.lean();

		if (!post) {
			return post;
		}

		const extendedLikesInfo = await this.likesPostQueryRepository.getLikesByPostId(
			postId,
			userId,
		);

		return { ...post, extendedLikesInfo };
	}

	getCountPosts(filter?: { blogId?: string }): Promise<number> {
		const postsQueryCount = PostsModel.countDocuments();

		if (filter?.blogId) {
			postsQueryCount.where('blogId', filter.blogId);
		}

		return postsQueryCount;
	}
}
