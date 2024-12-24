import { injectable } from 'inversify';
import { CommentViewDto } from './comments.dto';
import { ItemsPaginationViewDto, PaginationQueries } from '../../types';
import { CommentsModel } from './comments.model';
import { getLikesInfoByUser } from '../../helpers/getLikesInfoByUser';

@injectable()
export class CommentsQueryRepository {
	async getCommentsByPostId(
		postId: string,
		{ sortBy, sortDirection, pageSize, pageNumber }: PaginationQueries,
		userId?: string,
	): Promise<ItemsPaginationViewDto<CommentViewDto>> {
		const comments = await CommentsModel.find({ postId })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-__v -_id -updatedAt -postId')
			.lean();

		const commentsCountByFilter = await this.getCountComments(postId);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(commentsCountByFilter / pageSize),
			pageSize,
			totalCount: commentsCountByFilter,
			items: comments.length
				? comments.map(comment => ({
						...comment,
						likesInfo: getLikesInfoByUser(comment?.likesInfo, userId),
					}))
				: [],
		};
	}

	async getCommentById(commentId: string, userId?: string): Promise<CommentViewDto | null> {
		const comment = await CommentsModel.findOne({ id: commentId })
			.select('-__v -_id -updatedAt -postId')
			.lean();

		if (!comment) {
			return null;
		}

		return {
			...comment,
			likesInfo: getLikesInfoByUser(comment?.likesInfo, userId),
		};
	}

	getCountComments(postId: string): Promise<number> {
		return CommentsModel.countDocuments({ postId }).exec();
	}
}
