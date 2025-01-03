import { injectable } from 'inversify';
import { Response } from 'express';
import { ReqBodyWithParams, ReqParams } from '../../types';
import { CommentsQueryRepository } from './comments.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { CommentLikeDto, CommentUpdateDto } from './comments.dto';
import { CommentsService } from './comments.service';
import { inject } from 'inversify';

@injectable()
export class CommentsController {
	constructor(
		@inject(CommentsQueryRepository)
		private readonly commentQueryRepository: CommentsQueryRepository,
		@inject(CommentsService) private readonly commentsService: CommentsService,
	) {}

	async getCommentById(req: ReqParams<{ id: string }>, res: Response) {
		try {
			const comment = await this.commentQueryRepository.getCommentById(
				req.params.id,
				req.user?.id,
			);
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
			const comment = await this.commentQueryRepository.getCommentById(req.params.commentId);
			if (!comment) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			if (comment?.commentatorInfo.userId !== req.user?.id) {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
				return;
			}

			await this.commentsService.updateCommentById(req.params.commentId, req.body);
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async likeCommentById(
		req: ReqBodyWithParams<{ commentId: string }, CommentLikeDto>,
		res: Response,
	) {
		try {
			const comment = await this.commentQueryRepository.getCommentById(
				req.params.commentId,
				req.user?.id,
			);
			if (!comment) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const result = await this.commentsService.likeCommentById(
				comment,
				req.body,
				req.user?.id!,
			);
			if ('errorsMessages' in result) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async deleteCommentById(req: ReqParams<{ commentId: string }>, res: Response) {
		try {
			const comment = await this.commentQueryRepository.getCommentById(
				req.params.commentId,
				req.user?.id,
			);
			if (!comment) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			if (comment?.commentatorInfo.userId !== req.user?.id) {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
				return;
			}

			await this.commentsService.deleteCommentById(req.params.commentId);
			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}
}
