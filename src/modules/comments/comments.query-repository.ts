import { CommentViewDto } from './comments.dto';
import { ItemsPaginationViewDto, PaginationQueries } from '../../types';
import { CommentDocument, CommentsModel } from './comments.model';
import { Model } from 'mongoose';
import { getLikesInfoByUser } from '../../helpers/getLikesInfoByUser';

export class CommentsQueryRepository {
	constructor(private readonly CommentsModel: Model<CommentDocument>) {}

	async getCommentsByPostId(
		postId: string,
		{ sortBy, sortDirection, pageSize, pageNumber }: PaginationQueries,
		userId?: string,
	): Promise<ItemsPaginationViewDto<CommentViewDto>> {
		const comments = await this.CommentsModel.find({ postId })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-__v -_id -updatedAt')
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
		const comment = await this.CommentsModel.findOne({ id: commentId })
			.select('-__v -_id -updatedAt')
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
		return this.CommentsModel.countDocuments({ postId }).exec();
	}
}

const commentQueryRepository = new CommentsQueryRepository(CommentsModel);

export { commentQueryRepository };
