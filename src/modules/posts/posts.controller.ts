import { Response } from 'express';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
} from '../../types';
import { PostsQueryRepository, postsQueryRepository } from './posts.query-repository';
import { HTTP_STATUSES, VALIDATION_MESSAGES } from '../../constants';
import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';
import { BlogsQueryRepository, blogsQueryRepository } from '../blogs/blogs.query-repository';
import { PostsService, postsService } from './posts.service';
import {
	commentQueryRepository,
	CommentsQueryRepository,
} from '../comments/comments.query-repository';
import { CommentCreateDto } from '../comments/comments.dto';
import { UsersQueryRepository, usersQueryRepository } from '../users/users.query-repository';
import { commentsService, CommentsService } from '../comments/comments.service';

class PostsController {
	constructor(
		private readonly postsQueryRepository: PostsQueryRepository,
		private readonly blogsQueryRepository: BlogsQueryRepository,
		private readonly commentQueryRepository: CommentsQueryRepository,
		private readonly usersQueryRepository: UsersQueryRepository,
		private readonly postsService: PostsService,
		private readonly commentsService: CommentsService,
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
					field: 'blogId',
					message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
				});

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
				req.user?.id
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
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}
}

export const postsController = new PostsController(
	postsQueryRepository,
	blogsQueryRepository,
	commentQueryRepository,
	usersQueryRepository,
	postsService,
	commentsService,
);
