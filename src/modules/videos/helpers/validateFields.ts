import { ErrorMessage, ValidationErrorViewDto } from '../../../types';
import { VideoCreateDto } from '../videos.dto';
import { AVAILABLE_RESOLUTIONS } from '../constants';

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
		errors.errorsMessages.push({ field: 'availableResolutions', message: 'Field must be not empty' });
	} else {
		const isIncludeAvailableResolutions = AVAILABLE_RESOLUTIONS.filter(resolution => availableResolutions.includes(resolution)).length;

		if(!isIncludeAvailableResolutions) {
			errors.errorsMessages.push({ field: 'availableResolutions', message: 'Field must include at least one of this value: P144, P240, P360, P480, P720, P1080, P1440, P2160' });
		}
	}

	return errors;
};

function validateStringField(field: string, fieldName: string, maxLength: number): ErrorMessage | void {
	if (typeof field !== 'string') {
		return { field: fieldName, message: 'Field must be a string' };
	}

	if (!field?.trim()) {
		return { field: fieldName, message: 'Field must be not empty' };
	}

	if (field.length > maxLength) {
		return {
			field: fieldName,
			message: `Field must be to have length not more ${maxLength} symbols`,
		};
	}
}
