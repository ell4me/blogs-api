import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';
import { blogsService } from '../../modules/blogs/blogs.service';

export const blogIdMiddleware = body('blogId')
	.isString()
	.withMessage(VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'))
	.trim()
	.notEmpty()
	.withMessage(VALIDATION_MESSAGES.FIELD_EMPTY)
	.custom(blogId => blogsService.getBlogById(blogId))
	.withMessage(VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST);
