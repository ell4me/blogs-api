import { config } from 'dotenv';

config();

const SETTINGS = {
	PORT: process.env.PORT || 4000,
};

const ROUTERS_PATH = {
	VIDEOS: '/videos',
	TESTING: '/testing',
};

const HTTP_STATUSES = {
	CREATED_201: 201,
	NO_CONTENT_204: 204,
	BAD_REQUEST_400: 400,
	NOT_FOUND_404: 404,
}

export { ROUTERS_PATH, SETTINGS, HTTP_STATUSES };
