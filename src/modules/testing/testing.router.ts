import { Router } from 'express';
import { blogsRepository } from '../blogs/blogs.repository';
import { postsRepository } from '../posts/posts.repository';

export const testingRouter = Router();

testingRouter.delete('/all-data', (req, res) => {
	blogsRepository.deleteAllBlogs();
	postsRepository.deleteAllPosts();
	res.sendStatus(204);
});
