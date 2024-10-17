import { Router } from 'express';
import { ReqBody, ReqBodyWithParams, ReqParams } from '../../types';
import { PostCreateDto, PostUpdateDto } from './posts.dto';
import { HTTP_STATUSES } from '../../constants';
import {
	maxLengthStringMiddleware,
	fieldsCheckErrorsMiddleware,
	blogIdMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { postsService } from './posts.service';

export const postsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	maxLengthStringMiddleware('title', 30),
	maxLengthStringMiddleware('shortDescription', 100),
	maxLengthStringMiddleware('content', 1000),
	blogIdMiddleware,
	fieldsCheckErrorsMiddleware,
];

postsRouter.get('/', (req, res) => {
	const posts = postsService.getAllPosts();
	res.send(posts);
});

postsRouter.get('/:id', (req: ReqParams<{ id: string }>, res) => {
	const post = postsService.getPostById(req.params.id);

	if (!post) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	res.send(post);
});

postsRouter.post(
	'/',
	...validationMiddlewares,
	({ body: newPost }: ReqBody<PostCreateDto>, res) => {
		const post = postsService.createPost(newPost);
		res.status(HTTP_STATUSES.CREATED_201).send(post);
	},
);

postsRouter.put(
	'/:id',
	...validationMiddlewares,
	(req: ReqBodyWithParams<{ id: string }, PostUpdateDto>, res) => {
		const isUpdated = postsService.updatePostById(req.params.id, req.body);

		if (!isUpdated) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	},
);

postsRouter.delete('/:id', authMiddleware, (req: ReqParams<{ id: string }>, res) => {
	const isDeleted = postsService.deletePostById(req.params.id);

	if (!isDeleted) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
