import { Router } from 'express';
import { blogsRepository } from '../blogs/blogs.repository';
import { postsRepository } from '../posts/posts.repository';
import { HTTP_STATUSES } from '../../constants';

export const testingRouter = Router();

testingRouter.delete('/all-data', async (req, res) => {
	try {
		await blogsRepository.deleteAllBlogs();
		await postsRepository.deleteAllPosts();
		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
