import { body } from 'express-validator';

export const PATTERNS = {
	LOGIN: /^[a-zA-Z0-9_-]*$/,
	EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
}

export const patternMiddleware = (field: string, pattern: RegExp | string) => body(field).matches(pattern).withMessage(`${field} doesn't match to pattern`);