import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';

export const maxLengthStringMiddleware = (field: string, maxLength: number) =>
	body(field)
		.isString()
		.withMessage(VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'))
		.trim()
		.notEmpty()
		.withMessage(VALIDATION_MESSAGES.FIELD_EMPTY)
		.isLength({
			max: maxLength,
		})
		.withMessage(VALIDATION_MESSAGES.MAX_LENGTH(maxLength));
