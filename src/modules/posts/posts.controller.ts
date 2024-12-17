import { Response } from 'express';
import {
	FilteredBlogQueries,
	ReqBody,
	ReqBodyWithParams,
	ReqParams,
	ReqQuery,
	ReqQueryWithParams,
} from '../../types';
import { postsQueryRepository } from './posts.query-repository';
import { HTTP_STATUSES, VALIDATION_MESSAGES } from '../../constants';
import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';
import { blogsQueryRepository } from '../blogs/blogs.query-repository';
import { postsService } from './posts.service';
import { commentQueryRepository } from '../comments/comments.query-repository';
import { CommentCreateDto } from '../comments/comments.dto';
import { usersQueryRepository } from '../users/users.query-repository';
import { commentsService } from '../comments/comments.service';

class PostsController {
	async getAllPosts(req: ReqQuery<FilteredBlogQueries>, res: Response) {
		try {
			const posts = await postsQueryRepository.getAllPosts(req.query);
			res.send(posts);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async getPostById(req: ReqParams<{ id: string }>, res: Response) {
		try {
			const post = await postsQueryRepository.getPostById(req.params.id);

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
			const blog = await blogsQueryRepository.getBlogById(newPost.blogId);

			if (!blog) {
				res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
					field: 'blogId',
					message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
				});

				return;
			}

			const { id } = await postsService.createPost({ ...newPost, blogName: blog.name });
			const post = await postsQueryRepository.getPostById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(post!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async updatePostById(req: ReqBodyWithParams<{ id: string }, PostUpdateDto>, res: Response) {
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
	}

	async deletePostById(req: ReqParams<{ id: string }>, res: Response) {
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
	}

	async getCommentsByPostId(
		req: ReqQueryWithParams<{ postId: string }, FilteredBlogQueries>,
		res: Response,
	) {
		try {
			const post = await postsQueryRepository.getPostById(req.params.postId);
			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const comments = await commentQueryRepository.getCommentsByPostId(
				req.params.postId,
				req.query,
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
			const post = await postsQueryRepository.getPostById(req.params.postId);
			if (!post) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			const user = await usersQueryRepository.getUserById(req.user.id!);
			const { id } = await commentsService.createComment(req.body, req.params.postId, user!);

			const comment = await commentQueryRepository.getCommentById(id);

			res.status(HTTP_STATUSES.CREATED_201).send(comment!);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}
}

export const postsController = new PostsController();
