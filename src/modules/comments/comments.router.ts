import { Router } from 'express';

import { ReqBodyWithParams, ReqParams } from '../../types';
import { HTTP_STATUSES } from '../../constants';
import { fieldsCheckErrorsMiddleware, stringMiddleware } from '../../middlewares/validation';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { CommentUpdateDto } from './comments.dto';
import { commentsService } from './comments.service';
import { commentQueryRepository } from './comments.query-repository';

export const commentsRouter = Router();
const validationMiddlewares = [
	authBearerMiddleware,
	stringMiddleware({ field: 'content', minLength: 20, maxLength: 300 }),
	fieldsCheckErrorsMiddleware,
];

commentsRouter.get('/:id', async (req: ReqParams<{ id: string }>, res) => {
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
});

commentsRouter.put(
	'/:commentId',
	...validationMiddlewares,
	async (req: ReqBodyWithParams<{ commentId: string }, CommentUpdateDto>, res) => {
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
	},
);

commentsRouter.delete(
	'/:commentId',
	authBearerMiddleware,
	fieldsCheckErrorsMiddleware,
	async (req: ReqParams<{ commentId: string }>, res) => {
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
	},
);
