import { Router } from 'express';
import { blogsRepository } from '../blogs/blogs.repository';
import { postsRepository } from '../posts/posts.repository';
import { usersRepository } from '../users/users.repository';
import { commentsRepository } from '../comments/comments.repository';
import { rateLimitRepository } from '../rateLimit/rateLimit.repository';
import { HTTP_STATUSES } from '../../constants';
import { securityDevicesRepository } from '../securityDevices/securityDevices.repository';

export const testingRouter = Router();

testingRouter.delete('/all-data', async (req, res) => {
	try {
		await blogsRepository.deleteAllBlogs();
		await postsRepository.deleteAllPosts();
		await usersRepository.deleteAllUsers();
		await commentsRepository.deleteAllComments();
		await rateLimitRepository.deleteAllRateLimits();
		await securityDevicesRepository.deleteAllSessions();
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
