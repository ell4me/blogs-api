import { ErrorMessage, ValidationErrorViewDto } from '../../../types';
import { VideoCreateDto } from '../videos.dto';
import { AVAILABLE_RESOLUTIONS, VALIDATION_MESSAGES } from '../constants';

export const validateFields = ({
								   title,
								   author,
								   availableResolutions,
							   }: VideoCreateDto): ValidationErrorViewDto => {
	const errors: ValidationErrorViewDto = { errorsMessages: [] };
	const validateTitle = validateStringField(title, 'title', 40);
	const validateAuthor = validateStringField(author, 'author', 20);

	if (validateTitle) {
		errors.errorsMessages.push(validateTitle);
	}

	if (validateAuthor) {
		errors.errorsMessages.push(validateAuthor);
	}

	if (!availableResolutions?.length) {
		errors.errorsMessages.push({ field: 'availableResolutions', message: VALIDATION_MESSAGES.FIELD_EMPTY });
	} else {
		const availableResolutionsLength = AVAILABLE_RESOLUTIONS.filter(resolution => availableResolutions.includes(resolution)).length;

		if (availableResolutionsLength !== availableResolutions.length) {
			errors.errorsMessages.push({
				field: 'availableResolutions',
				message: VALIDATION_MESSAGES.AVAILABLE_RESOLUTIONS,
			});
		}
	}

	return errors;
};

function validateStringField(field: string, fieldName: string, maxLength: number): ErrorMessage | void {
	if (typeof field !== 'string') {
		return { field: fieldName, message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string') };
	}

	if (!field?.trim()) {
		return { field: fieldName, message: VALIDATION_MESSAGES.FIELD_EMPTY };
	}

	if (field.length > maxLength) {
		return {
			field: fieldName,
			message: VALIDATION_MESSAGES.MAX_LENGTH(maxLength),
		};
	}
}
