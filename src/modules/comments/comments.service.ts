import { injectable, inject } from 'inversify';
import { CommentsRepository } from './comments.repository';
import { CommentCreateDto, CommentLikeDto, CommentUpdateDto, CommentViewDto } from './comments.dto';
import { UserViewDto } from '../users/users.dto';
import { CommentCreate } from './comments.types';
import { ValidationErrorViewDto } from '../../types';
import { STATUSES_LIKE, VALIDATION_MESSAGES } from '../../constants';

@injectable()
export class CommentsService {
	constructor(
		@inject(CommentsRepository) private readonly commentsRepository: CommentsRepository,
	) {}

	async createComment(
		{ content }: CommentCreateDto,
		postId: string,
		user: UserViewDto,
	): Promise<{ id: string }> {
		const id = new Date().getTime().toString();

		const newComment: CommentCreate = {
			id,
			content,
			postId,
			commentatorInfo: {
				userId: user.id,
				userLogin: user.login,
			},
		};

		await this.commentsRepository.createComment(newComment);

		return { id };
	}

	async updateCommentById(commentId: string, content: CommentUpdateDto): Promise<boolean> {
		return this.commentsRepository.updateCommentById(commentId, content);
	}

	async likeCommentById(
		{ likesInfo, id }: CommentViewDto,
		{ likeStatus }: CommentLikeDto,
		userId: string,
	): Promise<ValidationErrorViewDto | { result: boolean }> {
		if (!STATUSES_LIKE.includes(likeStatus)) {
			return {
				errorsMessages: [
					{
						message: VALIDATION_MESSAGES.LIKE_STATUS,
						field: 'likeStatus',
					},
				],
			};
		}

		if (likesInfo.myStatus === likeStatus) {
			return { result: false };
		}

		const result = await this.commentsRepository.likeCommentById(id, userId, likeStatus);

		return { result };
	}

	async deleteCommentById(commentId: string): Promise<boolean> {
		return this.commentsRepository.deleteCommentById(commentId);
	}
}
