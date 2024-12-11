import { config } from 'dotenv';

config();

export const SETTINGS = {
	PORT: process.env.PORT || 80,
	DB_HOST: process.env.DB_HOST || 'mongodb://mongodb:27017',
	DB_NAME: process.env.DB_NAME || 'blog_db',
	DB_NAME_TEST: 'test',
	DB_USER: process.env.DB_USER || 'root',
	DB_PASS: process.env.DB_PASS || 'password',
	LOGIN: process.env.LOGIN || 'admin',
	PASSWORD: process.env.PASSWORD || 'qwerty',
	JWT_SECRET: process.env.JWT_SECRET || 'cat',
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dog',
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASSWORD: process.env.SMTP_PASSWORD,
	HOST: process.env.HOST,
};

// In seconds
export const EXPIRATION_TOKEN = {
	ACCESS: 10,
	REFRESH: 20,
};

export const COLLECTION_NAMES = {
	BLOGS: 'blogs',
	POSTS: 'posts',
	USERS: 'users',
	COMMENTS: 'comments',
	RATE_LIMIT: 'rateLimit',
	SECURITY_DEVICES: 'securityDevices',
};

export const ROUTERS_PATH = {
	BLOGS: '/blogs',
	POSTS: '/posts',
	TESTING: '/testing',
	USERS: '/users',
	AUTH: '/auth',
	COMMENTS: '/comments',
	SECURITY_DEVICES: '/security/devices',
};

export const HTTP_STATUSES = {
	CREATED_201: 201,
	NO_CONTENT_204: 204,
	BAD_REQUEST_400: 400,
	UNAUTHORIZED_401: 401,
	FORBIDDEN_403: 403,
	NOT_FOUND_404: 404,
	TOO_MANY_REQUESTS_429: 429,
	INTERNAL_SERVER_500: 500,
};

export const VALIDATION_MESSAGES = {
	FIELD_EMPTY: 'Field must be not empty',
	FIELD_IS_NOT_URL: 'It`s not an url',
	BLOG_IS_NOT_EXIST: 'Blog with current id doesn`t exist',
	FIELD_RANGE: 'Field must be to have value in range from 1 to 18',
	AVAILABLE_RESOLUTIONS:
		'Field must include at least one of this value and nothing else: P144, P240, P360, P480, P720, P1080, P1440, P2160',
	FIELD_INVALID_TYPE: (type: string) => `Field must be ${type}`,
	LENGTH: ({ maxLength, minLength }: { maxLength?: number; minLength?: number }) => {
		if (maxLength && minLength) {
			return `Field must not be more than ${maxLength} symbols and less than ${minLength}`;
		}

		if (maxLength) {
			return `Field must not be more than ${maxLength} symbols`;
		}

		return `Field must not be less than ${minLength} symbols`;
	},
	FIELD_IS_EXIST: (field: string) => `User with current ${field} is already exist`,
	FIELD_IS_NOT_MATCH: (field: string) => `${field} doesn't match to pattern`,
	USER_IS_NOT_FOUND: 'User with that email is not found',
	CONFIRMATION_CODE_IS_NOT_CORRECT: 'Confirmation code is not correct',
	CONFIRMATION_CODE_EXPIRED: 'Confirmation code has already expired',
	USER_ALREADY_CONFIRMED: 'User has already confirmed',
};
