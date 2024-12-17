import { CommentsRepository, commentsRepository } from './comments.repository';
import { CommentCreateDto, CommentUpdateDto } from './comments.dto';
import { UserViewDto } from '../users/users.dto';
import { CommentCreate } from './comments.types';

export class CommentsService {
	constructor(private readonly commentsRepository: CommentsRepository) {}

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

	async deleteCommentById(commentId: string): Promise<boolean> {
		return this.commentsRepository.deleteCommentById(commentId);
	}
}

export const commentsService = new CommentsService(commentsRepository);
