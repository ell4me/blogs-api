import { Response } from 'express';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
	ValidationErrorViewDto,
} from '../../types';
import { PostsQueryRepository } from './posts.query-repository';
import { HTTP_STATUSES, VALIDATION_MESSAGES } from '../../constants';
import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';
import { BlogsQueryRepository } from '../blogs/blogs.query-repository';
import { PostsService } from './posts.service';
import { CommentsQueryRepository } from '../comments/comments.query-repository';
import { CommentCreateDto } from '../comments/comments.dto';
import { UsersQueryRepository } from '../users/users.query-repository';
import { CommentsService } from '../comments/comments.service';
import { inject, injectable } from 'inversify';

@injectable()
export class PostsController {
	constructor(
		@inject(PostsQueryRepository) private readonly postsQueryRepository: PostsQueryRepository,
		@inject(BlogsQueryRepository) private readonly blogsQueryRepository: BlogsQueryRepository,
		@inject(CommentsQueryRepository)
		private readonly commentQueryRepository: CommentsQueryRepository,
		@inject(UsersQueryRepository) private readonly usersQueryRepository: UsersQueryRepository,
		@inject(PostsService) private readonly postsService: PostsService,
		@inject(CommentsService) private readonly commentsService: CommentsService,
	) {}

	async getAllPosts(req: ReqQuery<FilteredBlogQueries>, res: Response) {
		try {
			const posts = await this.postsQueryRepository.getAllPosts(req.query);
			res.send(posts);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async getPostById(req: ReqParams<{ id: string }>, res: Response) {
		try {
			const post = await this.postsQueryRepository.getPostById(req.params.id);

			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			res.send(post);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async createPost({ body: newPost }: ReqBody<PostCreateByBlogIdDto>, res: Response) {
		try {
			const blog = await this.blogsQueryRepository.getBlogById(newPost.blogId);

			if (!blog) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
					errorsMessages: [
						{
							field: 'blogId',
							message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
						},
					],
				} as ValidationErrorViewDto);

				return;
			}

			const { id } = await this.postsService.createPost({ ...newPost, blogName: blog.name });
			const post = await this.postsQueryRepository.getPostById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(post!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async updatePostById(req: ReqBodyWithParams<{ id: string }, PostUpdateDto>, res: Response) {
		try {
			const blog = await this.blogsQueryRepository.getBlogById(req.body.blogId);

			if (!blog) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
					errorsMessages: [
						{
							field: 'blogId',
							message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
						},
					],
				} as ValidationErrorViewDto);

				return;
			}

			const isUpdated = await this.postsService.updatePostById(req.params.id, req.body);

			if (!isUpdated) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async deletePostById(req: ReqParams<{ id: string }>, res: Response) {
		try {
			const isDeleted = await this.postsService.deletePostById(req.params.id);

			if (!isDeleted) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async getCommentsByPostId(
		req: ReqQueryWithParams<{ postId: string }, FilteredBlogQueries>,
		res: Response,
	) {
		try {
			const post = await this.postsQueryRepository.getPostById(req.params.postId);
			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const comments = await this.commentQueryRepository.getCommentsByPostId(
				req.params.postId,
				req.query,
				req.user?.id,
			);
			res.send(comments);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async createComment(
		req: ReqBodyWithParams<{ postId: string }, CommentCreateDto>,
		res: Response,
	) {
		try {
			const post = await this.postsQueryRepository.getPostById(req.params.postId);
			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const user = await this.usersQueryRepository.getUserById(req.user?.id!);
			const { id } = await this.commentsService.createComment(
				req.body,
				req.params.postId,
				user!,
			);

			const comment = await this.commentQueryRepository.getCommentById(id, req.user?.id);

			res.status(HTTP_STATUSES.CREATED_201).send(comment!);
		} catch (e) {
			console.log(e, 'e');
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}
}
