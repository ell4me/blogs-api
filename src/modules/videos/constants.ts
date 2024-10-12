const AVAILABLE_RESOLUTIONS = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'] as const;

const VALIDATION_MESSAGES = {
	FIELD_EMPTY: 'Field must be not empty',
	FIELD_RANGE: 'Field must be to have value in range from 1 to 18',
	AVAILABLE_RESOLUTIONS: 'Field must include at least one of this value and nothing else: P144, P240, P360, P480, P720, P1080, P1440, P2160',
	FIELD_INVALID_TYPE: (type: string) => `Field must be ${type}`,
	MAX_LENGTH: (maxLength: number) => `Field must be to have length not more ${maxLength} symbols`,
};

export { AVAILABLE_RESOLUTIONS, VALIDATION_MESSAGES };
