import { Router } from 'express';
import { blogsService } from './blogs.service';
import { FilteredQueries, ReqBody, ReqBodyWithParams, ReqParams, ReqQuery, ReqQueryWithParams } from '../../types';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { HTTP_STATUSES } from '../../constants';
import {
	maxLengthStringMiddleware,
	websiteUrlValidationMiddlewares,
	fieldsCheckErrorsMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryParserMiddleware } from '../../middlewares/queryParser.middleware';
import { PostCreateDto } from '../posts/posts.dto';

export const blogsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	...websiteUrlValidationMiddlewares,
	maxLengthStringMiddleware('name', 15),
	maxLengthStringMiddleware('description', 500),
	fieldsCheckErrorsMiddleware,
];

blogsRouter.get('/', queryParserMiddleware, async (req: ReqQuery<FilteredQueries>, res) => {
	try {
		const blogs = await blogsService.getAllBlogs(req.query);
		res.send(blogs);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

blogsRouter.get('/:id', async (req: ReqParams<{ id: string }>, res) => {
	try {
		const blog = await blogsService.getBlogById(req.params.id);

		if (!blog) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.send(blog);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

blogsRouter.get('/:id/posts', queryParserMiddleware, async (req: ReqQueryWithParams<{ id: string }, FilteredQueries>, res) => {
	try {
		const result = await blogsService.getPostsByBlogId(req.params.id, req.query);

		if (!result) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.send(result);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

blogsRouter.post(
	'/',
	...validationMiddlewares,
	async ({ body: newBlog }: ReqBody<BlogCreateDto>, res) => {
		try {
			const blog = await blogsService.createBlog(newBlog);
			res.status(HTTP_STATUSES.CREATED_201).send(blog);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

blogsRouter.post(
	'/:id/posts',
	authMiddleware,
	maxLengthStringMiddleware('title', 30),
	maxLengthStringMiddleware('shortDescription', 100),
	maxLengthStringMiddleware('content', 1000),
	fieldsCheckErrorsMiddleware,
	async ({ body: newPost, params }: ReqBodyWithParams<{ id: string }, PostCreateDto>, res) => {
		try {
			const post = await blogsService.createPostByBlogId(params.id, newPost);

			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			res.status(HTTP_STATUSES.CREATED_201).send(post);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

blogsRouter.put(
	'/:id',
	...validationMiddlewares,
	async (req: ReqBodyWithParams<{ id: string }, BlogUpdateDto>, res) => {
		try {
			const isUpdated = await blogsService.updateBlogById(req.params.id, req.body);

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

blogsRouter.delete('/:id', authMiddleware, async (req: ReqParams<{ id: string }>, res) => {
	try {
		const isDeleted = await blogsService.deleteBlogById(req.params.id);

		if (!isDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
