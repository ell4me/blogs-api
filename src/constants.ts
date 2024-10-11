import { config } from 'dotenv';

config();

const SETTINGS = {
	PORT: process.env.PORT || 4000,
};

const ROUTERS_PATH = {
	VIDEOS: '/videos',
	TESTING: '/testing',
};

export { ROUTERS_PATH, SETTINGS };
