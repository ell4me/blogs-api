import { Router } from 'express';
import { blogsService } from './blogs.service';
import { ReqBody, ReqBodyWithParams, ReqParams } from '../../types';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { HTTP_STATUSES } from '../../constants';
import {
	maxLengthStringMiddleware,
	websiteUrlValidationMiddlewares,
	fieldsCheckErrorsMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';

export const blogsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	...websiteUrlValidationMiddlewares,
	maxLengthStringMiddleware('name', 15),
	maxLengthStringMiddleware('description', 500),
	fieldsCheckErrorsMiddleware,
];

blogsRouter.get('/', async (req, res) => {
	try {
		const blogs = await blogsService.getAllBlogs();
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
			res.status(HTTP_STATUSES.NOT_FOUND_404).send(isDeleted);
			return;
		}

		res.status(HTTP_STATUSES.NO_CONTENT_204).send(isDeleted);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
