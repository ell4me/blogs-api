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

blogsRouter.get('/', (req, res) => {
	const blogs = blogsService.getAllBlogs();
	res.send(blogs);
});

blogsRouter.get('/:id', (req: ReqParams<{ id: string }>, res) => {
	const blog = blogsService.getBlogById(req.params.id);

	if (!blog) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	res.send(blog);
});

blogsRouter.post(
	'/',
	...validationMiddlewares,
	({ body: newBlog }: ReqBody<BlogCreateDto>, res) => {
		const blog = blogsService.createBlog(newBlog);
		res.status(HTTP_STATUSES.CREATED_201).send(blog);
	},
);

blogsRouter.put(
	'/:id',
	...validationMiddlewares,
	(req: ReqBodyWithParams<{ id: string }, BlogUpdateDto>, res) => {
		const isUpdated = blogsService.updateBlogById(req.params.id, req.body);

		if (!isUpdated) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	},
);

blogsRouter.delete('/:id', authMiddleware, (req: ReqParams<{ id: string }>, res) => {
	const isDeleted = blogsService.deleteBlogById(req.params.id);

	if (!isDeleted) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
