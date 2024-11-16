import { body } from 'express-validator';
import { VALIDATION_MESSAGES } from '../../constants';

export const stringMiddleware = ({ field, maxLength, minLength }: {
	field: string,
	maxLength?: number,
	minLength?: number
}) => {
	const validation = body(field)
		.isString()
		.withMessage(VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'))
		.trim()
		.notEmpty()
		.withMessage(VALIDATION_MESSAGES.FIELD_EMPTY);

	if (maxLength || minLength) {
		return validation.isLength({
			max: maxLength,
			min: minLength,
		}).withMessage(VALIDATION_MESSAGES.LENGTH({ maxLength, minLength }));
	}

	return validation;
};
