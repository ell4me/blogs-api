import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';
import { stringMiddleware } from './stringMiddleware';

const FIELD_NAME = 'websiteUrl';
const websiteUrlMiddleware = body(FIELD_NAME)
	.matches('^http(s)*://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$')
	.withMessage(VALIDATION_MESSAGES.FIELD_IS_NOT_URL);

export const websiteUrlValidationMiddlewares = [
	stringMiddleware({ field: FIELD_NAME, maxLength: 100 }),
	websiteUrlMiddleware,
];
