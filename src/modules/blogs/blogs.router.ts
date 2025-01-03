import { Router } from 'express';
import {
	stringMiddleware,
	websiteUrlValidationMiddlewares,
	fieldsCheckErrorsMiddleware,
} from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryBlogParserMiddleware } from '../../middlewares/queryParser.middleware';
import { BlogsController } from './blogs.controller';
import { compositionRoot } from '../../inversify.config';
import { accessTokenMiddleware } from '../../middlewares/accessToken.middleware';

const blogsController = compositionRoot.resolve(BlogsController);
export const blogsRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	...websiteUrlValidationMiddlewares,
	stringMiddleware({ field: 'name', maxLength: 15 }),
	stringMiddleware({ field: 'description', maxLength: 500 }),
	fieldsCheckErrorsMiddleware,
];

blogsRouter.get('/', queryBlogParserMiddleware, blogsController.getAllBlogs.bind(blogsController));
blogsRouter.get('/:id', blogsController.getBlogById.bind(blogsController));

blogsRouter.get(
	'/:id/posts',
	accessTokenMiddleware,
	queryBlogParserMiddleware,
	blogsController.getPostsByBlogId.bind(blogsController),
);

blogsRouter.post('/', ...validationMiddlewares, blogsController.createBlog.bind(blogsController));

blogsRouter.post(
	'/:id/posts',
	authMiddleware,
	stringMiddleware({ field: 'title', maxLength: 30 }),
	stringMiddleware({ field: 'shortDescription', maxLength: 100 }),
	stringMiddleware({ field: 'content', maxLength: 1000 }),
	fieldsCheckErrorsMiddleware,
	blogsController.createPostByBlogId.bind(blogsController),
);

blogsRouter.put(
	'/:id',
	...validationMiddlewares,
	blogsController.updateBlogById.bind(blogsController),
);

blogsRouter.delete('/:id', authMiddleware, blogsController.deleteBlogById.bind(blogsController));
