import { Router } from 'express';
import { blogsRepository } from '../blogs/blogs.repository';
import { postsRepository } from '../posts/posts.repository';
import { usersRepository } from '../users/users.repository';
import { commentsRepository } from '../comments/comments.repository';
import { HTTP_STATUSES } from '../../constants';

export const testingRouter = Router();

testingRouter.delete('/all-data', async (req, res) => {
	try {
		await blogsRepository.deleteAllBlogs();
		await postsRepository.deleteAllPosts();
		await usersRepository.deleteAllUsers();
		await commentsRepository.deleteAllComments();
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
