import { Router } from 'express';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { rateLimitRepository } from '../rateLimit/rateLimit.repository';
import { HTTP_STATUSES } from '../../constants';
import { compositionRoot } from '../../inversify.config';
import { SecurityDevicesRepository } from '../securityDevices/securityDevices.repository';
import { LikesPostRepository } from '../likesPost/likesPost.repository';

export const testingRouter = Router();
const securityDevicesRepository = compositionRoot.resolve(SecurityDevicesRepository);
const commentsRepository = compositionRoot.resolve(CommentsRepository);
const usersRepository = compositionRoot.resolve(UsersRepository);
const postsRepository = compositionRoot.resolve(PostsRepository);
const blogsRepository = compositionRoot.resolve(BlogsRepository);
const likesPostRepository = compositionRoot.resolve(LikesPostRepository);

testingRouter.delete('/all-data', async (req, res) => {
	try {
		await blogsRepository.deleteAllBlogs();
		await postsRepository.deleteAllPosts();
		await usersRepository.deleteAllUsers();
		await commentsRepository.deleteAllComments();
		await rateLimitRepository.deleteAllRateLimits();
		await securityDevicesRepository.deleteAllSessions();
		await likesPostRepository.deleteAllLikesPost();
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
