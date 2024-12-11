import { CommentViewDto } from './comments.dto';
import { ItemsPaginationViewDto, PaginationQueries } from '../../types';
import { CommentsModel } from './comments.model';

export class CommentsQueryRepository {
	async getCommentsByPostId(
		postId: string,
		{ sortBy, sortDirection, pageSize, pageNumber }: PaginationQueries,
	): Promise<ItemsPaginationViewDto<CommentViewDto>> {
		const comments = await CommentsModel.find({ postId })
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
		return CommentsModel.findOne({ id }).select('-__v -_id -updatedAt').exec();
	}

	getCountComments(postId: string): Promise<number> {
		return CommentsModel.countDocuments({ postId }).exec();
	}
}

const commentQueryRepository = new CommentsQueryRepository();

export { commentQueryRepository };
