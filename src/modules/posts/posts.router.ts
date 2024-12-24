import { Router } from 'express';
import { stringMiddleware, fieldsCheckErrorsMiddleware } from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryBlogParserMiddleware } from '../../middlewares/queryParser.middleware';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { PostsController } from './posts.controller';
import { accessTokenMiddleware } from '../../middlewares/accessToken.middleware';
import { compositionRoot } from '../../inversify.config';

const postsController = compositionRoot.resolve(PostsController);
export const postsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	stringMiddleware({ field: 'title', maxLength: 30 }),
	stringMiddleware({ field: 'shortDescription', maxLength: 100 }),
	stringMiddleware({ field: 'content', maxLength: 1000 }),
	stringMiddleware({ field: 'blogId' }),
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

postsRouter.get('/', queryBlogParserMiddleware, postsController.getAllPosts.bind(postsController));

postsRouter.get('/:id', postsController.getPostById.bind(postsController));

postsRouter.post('/', ...validationMiddlewares, postsController.createPost.bind(postsController));

postsRouter.put(
	'/:id',
	...validationMiddlewares,
	postsController.updatePostById.bind(postsController),
);

postsRouter.delete('/:id', authMiddleware, postsController.deletePostById.bind(postsController));

postsRouter.get(
	'/:postId/comments',
	accessTokenMiddleware,
	queryBlogParserMiddleware,
	postsController.getCommentsByPostId.bind(postsController),
);

postsRouter.post(
	'/:postId/comments',
	...commentsMiddlewares,
	postsController.createComment.bind(postsController),
);
