import { Router } from 'express';
import {
	stringMiddleware,
	websiteUrlValidationMiddlewares,
	fieldsCheckErrorsMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryBlogParserMiddleware } from '../../middlewares/queryParser.middleware';
import { blogsController } from './blogs.controller';

export const blogsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	...websiteUrlValidationMiddlewares,
	stringMiddleware({ field: 'name', maxLength: 15 }),
	stringMiddleware({ field: 'description', maxLength: 500 }),
	fieldsCheckErrorsMiddleware,
];

blogsRouter.get('/', queryBlogParserMiddleware, blogsController.getAllBlogs);
blogsRouter.get('/:id', blogsController.getBlogById);

blogsRouter.get('/:id/posts', queryBlogParserMiddleware, blogsController.getPostsByBlogId);

blogsRouter.post('/', ...validationMiddlewares, blogsController.createBlog);

blogsRouter.post(
	'/:id/posts',
	authMiddleware,
	stringMiddleware({ field: 'title', maxLength: 30 }),
	stringMiddleware({ field: 'shortDescription', maxLength: 100 }),
	stringMiddleware({ field: 'content', maxLength: 1000 }),
	fieldsCheckErrorsMiddleware,
	blogsController.createPostByBlogId,
);

blogsRouter.put('/:id', ...validationMiddlewares, blogsController.updateBlogById);

blogsRouter.delete('/:id', authMiddleware, blogsController.deleteBlogById);
