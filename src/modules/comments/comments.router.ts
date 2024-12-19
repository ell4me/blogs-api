import { Router } from 'express';

import { fieldsCheckErrorsMiddleware, stringMiddleware } from '../../middlewares/validation';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { commentsController } from './comments.controller';
import { accessTokenMiddleware } from '../../middlewares/accessToken.middleware';

export const commentsRouter = Router();
const validationMiddlewares = [
	authBearerMiddleware,
	stringMiddleware({ field: 'content', minLength: 20, maxLength: 300 }),
	fieldsCheckErrorsMiddleware,
];

const validationLikeMiddlewares = [
	authBearerMiddleware,
	stringMiddleware({ field: 'likeStatus' }),
	fieldsCheckErrorsMiddleware,
];

commentsRouter.get('/:id', accessTokenMiddleware, commentsController.getCommentById.bind(commentsController));

commentsRouter.put(
	'/:commentId',
	...validationMiddlewares,
	commentsController.updateCommentById.bind(commentsController),
);

commentsRouter.put(
	'/:commentId/like-status',
	...validationLikeMiddlewares,
	commentsController.likeCommentById.bind(commentsController),
);

commentsRouter.delete(
	'/:commentId',
	authBearerMiddleware,
	fieldsCheckErrorsMiddleware,
	commentsController.deleteCommentById.bind(commentsController),
);
