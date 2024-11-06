import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';
import { blogsQueryRepository } from '../../modules/blogs/blogs.query-repository';

export const blogIdMiddleware = body('blogId')
	.isString()
	.withMessage(VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'))
	.trim()
	.notEmpty()
	.withMessage(VALIDATION_MESSAGES.FIELD_EMPTY)
	.custom(async blogId => {
		const blog = await blogsQueryRepository.getBlogById(blogId);

		if (!blog) {
			throw new Error('Blog doesn`t exist');
		}
	})
	.withMessage(VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST);
