import { Router } from 'express';
import { FilteredQueries, ReqBody, ReqBodyWithParams, ReqParams, ReqQuery } from '../../types';
import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';
import { HTTP_STATUSES } from '../../constants';
import {
	maxLengthStringMiddleware,
	fieldsCheckErrorsMiddleware,
	blogIdMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { postsService } from './posts.service';
import { queryParserMiddleware } from '../../middlewares/queryParser.middleware';

export const postsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	maxLengthStringMiddleware('title', 30),
	maxLengthStringMiddleware('shortDescription', 100),
	maxLengthStringMiddleware('content', 1000),
	blogIdMiddleware,
	fieldsCheckErrorsMiddleware,
];

postsRouter.get('/', queryParserMiddleware, async (req: ReqQuery<FilteredQueries>, res) => {
	try {
		const posts = await postsService.getAllPosts(req.query);
		res.send(posts);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

postsRouter.get('/:id', async (req: ReqParams<{ id: string }>, res) => {
	try {
		const post = await postsService.getPostById(req.params.id);

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
			const post = await postsService.createPost(newPost);
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
