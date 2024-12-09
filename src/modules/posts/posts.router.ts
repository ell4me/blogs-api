import { Router } from 'express';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
} from '../../types';
import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';
import { HTTP_STATUSES, VALIDATION_MESSAGES } from '../../constants';
import {
	stringMiddleware,
	fieldsCheckErrorsMiddleware,
	blogIdMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { postsService } from './posts.service';
import { queryBlogParserMiddleware } from '../../middlewares/queryParser.middleware';
import { postsQueryRepository } from './posts.query-repository';
import { blogsQueryRepository } from '../blogs/blogs.query-repository';
import { commentQueryRepository } from '../comments/comments.query-repository';
import { CommentCreateDto } from '../comments/comments.dto';
import { authBearerMiddleware } from '../../middlewares/auth-bearer.middleware';
import { commentsService } from '../comments/comments.service';
import { usersQueryRepository } from '../users/users.query-repository';

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

postsRouter.get('/', queryBlogParserMiddleware, async (req: ReqQuery<FilteredBlogQueries>, res) => {
	try {
		const posts = await postsQueryRepository.getAllPosts(req.query);
		res.send(posts);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

postsRouter.get('/:id', async (req: ReqParams<{ id: string }>, res) => {
	try {
		const post = await postsQueryRepository.getPostById(req.params.id);

		if (!post) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.send(post);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

postsRouter.post(
	'/',
	...validationMiddlewares,
	async ({ body: newPost }: ReqBody<PostCreateByBlogIdDto>, res) => {
		try {
			const blog = await blogsQueryRepository.getBlogById(newPost.blogId);

			if (!blog) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
					field: 'blogId',
					message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
				});

				return;
			}

			const { id } = await postsService.createPost({ ...newPost, blogName: blog.name });
			const post = await postsQueryRepository.getPostById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(post!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

postsRouter.put(
	'/:id',
	...validationMiddlewares,
	async (req: ReqBodyWithParams<{ id: string }, PostUpdateDto>, res) => {
		try {
			const isUpdated = await postsService.updatePostById(req.params.id, req.body);

			if (!isUpdated) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

postsRouter.delete('/:id', authMiddleware, async (req: ReqParams<{ id: string }>, res) => {
	try {
		const isDeleted = await postsService.deletePostById(req.params.id);

		if (!isDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

postsRouter.get(
	'/:postId/comments',
	queryBlogParserMiddleware,
	async (req: ReqQueryWithParams<{ postId: string }, FilteredBlogQueries>, res) => {
		try {
			const post = await postsQueryRepository.getPostById(req.params.postId);
			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const comments = await commentQueryRepository.getCommentsByPostId(
				req.params.postId,
				req.query,
			);
			res.send(comments);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

postsRouter.post(
	'/:postId/comments',
	...commentsMiddlewares,
	async (req: ReqBodyWithParams<{ postId: string }, CommentCreateDto>, res) => {
		try {
			const post = await postsQueryRepository.getPostById(req.params.postId);
			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const user = await usersQueryRepository.getUserById(req.user.id!);
			const { id } = await commentsService.createComment(req.body, req.params.postId, user!);

			const comment = await commentQueryRepository.getCommentById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(comment!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);
