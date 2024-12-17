import { CommentViewDto } from './comments.dto';
import { ItemsPaginationViewDto, PaginationQueries } from '../../types';
import { CommentDocument, CommentsModel } from './comments.model';
import { Model } from 'mongoose';

export class CommentsQueryRepository {
	constructor(private readonly CommentsModel: Model<CommentDocument>) {}

	async getCommentsByPostId(
		postId: string,
		{ sortBy, sortDirection, pageSize, pageNumber }: PaginationQueries,
	): Promise<ItemsPaginationViewDto<CommentViewDto>> {
		const comments = await this.CommentsModel.find({ postId })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.select('-__v -_id -updatedAt');

		const commentsCountByFilter = await this.getCountComments(postId);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(commentsCountByFilter / pageSize),
			pageSize,
			totalCount: commentsCountByFilter,
			items: comments,
		};
	}

	getCommentById(id: string): Promise<CommentViewDto | null> {
		return this.CommentsModel.findOne({ id }).select('-__v -_id -updatedAt').exec();
	}

	getCountComments(postId: string): Promise<number> {
		return this.CommentsModel.countDocuments({ postId }).exec();
	}
}

const commentQueryRepository = new CommentsQueryRepository(CommentsModel);

export { commentQueryRepository };
