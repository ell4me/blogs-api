import { commentsCollection } from '../../helpers/runDb';
import { CommentViewDto } from './comments.dto';
import { ItemsPaginationViewDto, PaginationQueries } from '../../types';

export class CommentsQueryRepository {
	async getCommentsByPostId(postId: string, {
		sortBy,
		sortDirection,
		pageSize,
		pageNumber,
	}: PaginationQueries): Promise<ItemsPaginationViewDto<CommentViewDto>> {
		const comments = await commentsCollection.find({ postId }, { projection: { _id: false, postId: false } })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.toArray();
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
		return commentsCollection.findOne({ id }, { projection: { _id: false, postId: false } });
	}

	getCountComments(postId: string): Promise<number> {
		return commentsCollection.countDocuments({ postId });
	}
}

const commentQueryRepository = new CommentsQueryRepository();

export { commentQueryRepository };
