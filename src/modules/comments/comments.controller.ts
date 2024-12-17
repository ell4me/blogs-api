import { Response } from 'express';
import { ReqBodyWithParams, ReqParams } from '../../types';
import { commentQueryRepository } from './comments.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { CommentUpdateDto } from './comments.dto';
import { commentsService } from './comments.service';

class CommentsController {
	async getCommentById(req: ReqParams<{ id: string }>, res: Response) {
		try {
			const comment = await commentQueryRepository.getCommentById(req.params.id);
			if (!comment) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			res.send(comment);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async updateCommentById(
		req: ReqBodyWithParams<{ commentId: string }, CommentUpdateDto>,
		res: Response,
	) {
		try {
			const comment = await commentQueryRepository.getCommentById(req.params.commentId);
			if (!comment) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			if (comment?.commentatorInfo.userId !== req.user.id) {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
				return;
			}

			await commentsService.updateCommentById(req.params.commentId, req.body);
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async deleteCommentById(req: ReqParams<{ commentId: string }>, res: Response) {
		try {
			const comment = await commentQueryRepository.getCommentById(req.params.commentId);
			if (!comment) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			if (comment?.commentatorInfo.userId !== req.user.id) {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
				return;
			}

			await commentsService.deleteCommentById(req.params.commentId);
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}
}

export const commentsController = new CommentsController();
