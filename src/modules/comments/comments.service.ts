import { CommentsRepository, commentsRepository } from './comments.repository';
import { CommentCreateDto, CommentModel, CommentUpdateDto } from './comments.dto';
import { UserViewDto } from '../users/users.dto';

class CommentsService {
	private commentsRepository: CommentsRepository;

	constructor(commentsRepository: CommentsRepository) {
		this.commentsRepository = commentsRepository;
	}

	public async createComment({ content }: CommentCreateDto, postId: string, user: UserViewDto): Promise<{ id: string }> {
		const id = new Date().getTime().toString();

		const newComment: CommentModel = {
			id,
			content,
			postId,
			commentatorInfo: {
				userId: user.id,
				userLogin: user.login,
			},
			createdAt: new Date().toISOString(),

		};

		await this.commentsRepository.createComment(newComment);

		return { id };

	}

	public async updateCommentById(commentId: string, content: CommentUpdateDto): Promise<boolean> {
		return this.commentsRepository.updateCommentById(commentId, content);
	}

	public async deleteCommentById(commentId: string): Promise<boolean> {
		return this.commentsRepository.deleteCommentById(commentId);
	}
}

export const commentsService = new CommentsService(commentsRepository);
