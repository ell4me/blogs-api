import { config } from 'dotenv';

config();

export const SETTINGS = {
	PORT: process.env.PORT || 4000,
	LOGIN: 'admin',
	PASSWORD: 'qwerty'
};

export const ROUTERS_PATH = {
	BLOGS: '/blogs',
	POSTS: '/posts',
	TESTING: '/testing',
};

export const HTTP_STATUSES = {
	CREATED_201: 201,
	NO_CONTENT_204: 204,
	BAD_REQUEST_400: 400,
	UNAUTHORIZED_401: 401,
	NOT_FOUND_404: 404,
}

export const VALIDATION_MESSAGES = {
	FIELD_EMPTY: 'Field must be not empty',
	FIELD_IS_NOT_URL: 'It`s not an url',
	BLOG_IS_NOT_EXIST: 'Blog with current id doesn`t exist',
	FIELD_RANGE: 'Field must be to have value in range from 1 to 18',
	AVAILABLE_RESOLUTIONS: 'Field must include at least one of this value and nothing else: P144, P240, P360, P480, P720, P1080, P1440, P2160',
	FIELD_INVALID_TYPE: (type: string) => `Field must be ${type}`,
	MAX_LENGTH: (maxLength: number) => `Field must not be more than ${maxLength} symbols`,
};
