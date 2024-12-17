import { Response } from 'express';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
} from '../../types';
import { blogsQueryRepository } from './blogs.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { postsQueryRepository } from '../posts/posts.query-repository';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { blogsService } from './blogs.service';
import { PostCreateDto } from '../posts/posts.dto';
import { postsService } from '../posts/posts.service';

class BlogsController {
	async getAllBlogs(req: ReqQuery<FilteredBlogQueries>, res: Response) {
		try {
			const blogs = await blogsQueryRepository.getAllBlogs(req.query);
			res.send(blogs);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async getBlogById(req: ReqParams<{ id: string }>, res: Response) {
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
	}

	async getPostsByBlogId(
		req: ReqQueryWithParams<{ id: string }, FilteredBlogQueries>,
		res: Response,
	) {
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
	}

	async createBlog({ body: newBlog }: ReqBody<BlogCreateDto>, res: Response) {
		try {
			const { id } = await blogsService.createBlog(newBlog);
			const blog = await blogsQueryRepository.getBlogById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(blog!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async createPostByBlogId(
		{ body: newPost, params }: ReqBodyWithParams<{ id: string }, PostCreateDto>,
		res: Response,
	) {
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
	}

	async updateBlogById(req: ReqBodyWithParams<{ id: string }, BlogUpdateDto>, res: Response) {
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
	}

	async deleteBlogById(req: ReqParams<{ id: string }>, res: Response) {
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
	}
}

export const blogsController = new BlogsController();
