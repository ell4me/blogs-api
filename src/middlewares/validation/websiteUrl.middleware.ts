import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';
import { maxLengthStringMiddleware } from './maxLengthString.middleware';

const FIELD_NAME = 'websiteUrl';
const websiteUrlMiddleware = body(FIELD_NAME)
	.matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$')
	.withMessage(VALIDATION_MESSAGES.FIELD_IS_NOT_URL);

export const websiteUrlValidationMiddlewares = [
	maxLengthStringMiddleware(FIELD_NAME, 100),
	websiteUrlMiddleware,
];
