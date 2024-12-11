import { Router } from 'express';
import { blogsService } from './blogs.service';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
} from '../../types';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { HTTP_STATUSES } from '../../constants';
import {
	stringMiddleware,
	websiteUrlValidationMiddlewares,
	fieldsCheckErrorsMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryBlogParserMiddleware } from '../../middlewares/queryParser.middleware';
import { PostCreateDto } from '../posts/posts.dto';
import { blogsQueryRepository } from './blogs.query-repository';
import { postsQueryRepository } from '../posts/posts.query-repository';
import { postsService } from '../posts/posts.service';

export const blogsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	...websiteUrlValidationMiddlewares,
	stringMiddleware({ field: 'name', maxLength: 15 }),
	stringMiddleware({ field: 'description', maxLength: 500 }),
	fieldsCheckErrorsMiddleware,
];

blogsRouter.get('/', queryBlogParserMiddleware, async (req: ReqQuery<FilteredBlogQueries>, res) => {
	try {
		const blogs = await blogsQueryRepository.getAllBlogs(req.query);
		res.send(blogs);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

blogsRouter.get('/:id', async (req: ReqParams<{ id: string }>, res) => {
	try {
		const blog = await blogsQueryRepository.getBlogById(req.params.id);

		if (!blog) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.send(blog);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

blogsRouter.get(
	'/:id/posts',
	queryBlogParserMiddleware,
	async (
		req: ReqQueryWithParams<
			{
				id: string;
			},
			FilteredBlogQueries
		>,
		res,
	) => {
		try {
			const blog = await blogsQueryRepository.getBlogById(req.params.id);

			if (!blog) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const posts = await postsQueryRepository.getAllPosts(req.query, {
				blogId: req.params.id,
			});

			res.send(posts);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

blogsRouter.post(
	'/',
	...validationMiddlewares,
	async ({ body: newBlog }: ReqBody<BlogCreateDto>, res) => {
		try {
			const { id } = await blogsService.createBlog(newBlog);
			const blog = await blogsQueryRepository.getBlogById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(blog!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

blogsRouter.post(
	'/:id/posts',
	authMiddleware,
	stringMiddleware({ field: 'title', maxLength: 30 }),
	stringMiddleware({ field: 'shortDescription', maxLength: 100 }),
	stringMiddleware({ field: 'content', maxLength: 1000 }),
	fieldsCheckErrorsMiddleware,
	async ({ body: newPost, params }: ReqBodyWithParams<{ id: string }, PostCreateDto>, res) => {
		try {
			const blog = await blogsQueryRepository.getBlogById(params.id);

			if (!blog) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const { id } = await postsService.createPost({
				...newPost,
				blogId: params.id,
				blogName: blog.name,
			});
			const post = await postsQueryRepository.getPostById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(post!);
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
