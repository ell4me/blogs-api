import { Response } from 'express';
import { injectable, inject } from 'inversify';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
} from '../../types';
import { BlogsQueryRepository } from './blogs.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { PostsQueryRepository } from '../posts/posts.query-repository';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { BlogsService } from './blogs.service';
import { PostCreateDto } from '../posts/posts.dto';
import { PostsService } from '../posts/posts.service';

@injectable()
export class BlogsController {
	constructor(
		@inject(BlogsQueryRepository) private readonly blogsQueryRepository: BlogsQueryRepository,
		@inject(PostsQueryRepository) private readonly postsQueryRepository: PostsQueryRepository,
		@inject(BlogsService) private readonly blogsService: BlogsService,
		@inject(PostsService) private readonly postsService: PostsService,
	) {}

	async getAllBlogs(req: ReqQuery<FilteredBlogQueries>, res: Response) {
		try {
			const blogs = await this.blogsQueryRepository.getAllBlogs(req.query);
			res.send(blogs);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async getBlogById(req: ReqParams<{ id: string }>, res: Response) {
		try {
			const blog = await this.blogsQueryRepository.getBlogById(req.params.id);

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
			const blog = await this.blogsQueryRepository.getBlogById(req.params.id);

			if (!blog) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const posts = await this.postsQueryRepository.getAllPosts(req.query, req.user?.id, {
				blogId: req.params.id,
			});

			res.send(posts);
		} catch (e) {
			console.log(e);
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async createBlog({ body: newBlog }: ReqBody<BlogCreateDto>, res: Response) {
		try {
			const { id } = await this.blogsService.createBlog(newBlog);
			const blog = await this.blogsQueryRepository.getBlogById(id);

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
			const blog = await this.blogsQueryRepository.getBlogById(params.id);

			if (!blog) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const { id } = await this.postsService.createPost({
				...newPost,
				blogId: params.id,
				blogName: blog.name,
			});
			const post = await this.postsQueryRepository.getPostById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(post!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async updateBlogById(req: ReqBodyWithParams<{ id: string }, BlogUpdateDto>, res: Response) {
		try {
			const isUpdated = await this.blogsService.updateBlogById(req.params.id, req.body);

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
			const isDeleted = await this.blogsService.deleteBlogById(req.params.id);

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
