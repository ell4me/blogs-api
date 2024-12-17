import { Router } from 'express';
import {
	stringMiddleware,
	fieldsCheckErrorsMiddleware,
	blogIdMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryBlogParserMiddleware } from '../../middlewares/queryParser.middleware';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { postsController } from './posts.controller';

export const postsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	stringMiddleware({ field: 'title', maxLength: 30 }),
	stringMiddleware({ field: 'shortDescription', maxLength: 100 }),
	stringMiddleware({ field: 'content', maxLength: 1000 }),
	blogIdMiddleware,
	fieldsCheckErrorsMiddleware,
];

const commentsMiddlewares = [
	authBearerMiddleware,
	stringMiddleware({
		field: 'content',
		minLength: 20,
		maxLength: 300,
	}),
	fieldsCheckErrorsMiddleware,
];

postsRouter.get('/', queryBlogParserMiddleware, postsController.getAllPosts);

postsRouter.get('/:id', postsController.getPostById);

postsRouter.post('/', ...validationMiddlewares, postsController.createPost);

postsRouter.put('/:id', ...validationMiddlewares, postsController.updatePostById);

postsRouter.delete('/:id', authMiddleware, postsController.deletePostById);

postsRouter.get(
	'/:postId/comments',
	queryBlogParserMiddleware,
	postsController.getCommentsByPostId,
);

postsRouter.post('/:postId/comments', ...commentsMiddlewares, postsController.createComment);
