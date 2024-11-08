import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';

export const PATTERNS = {
	LOGIN: /^[a-zA-Z0-9_-]*$/,
	EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

export const patternMiddleware = (field: string, pattern: RegExp | string) =>
	body(field)
		.matches(pattern)
		.withMessage(VALIDATION_MESSAGES.FIELD_IS_NOT_MATCH(field));
