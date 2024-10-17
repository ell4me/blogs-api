import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';
import { blogsRepository } from '../../modules/blogs/blogs.repository';

export const blogIdMiddleware = body('blogId')
	.isString()
	.withMessage(VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'))
	.trim()
	.notEmpty()
	.withMessage(VALIDATION_MESSAGES.FIELD_EMPTY)
	.custom(blogId => blogsRepository.getBlogById(blogId))
	.withMessage(VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST);
