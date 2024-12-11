import mongoose from 'mongoose';

import { SETTINGS } from '../constants';

export const runDb = async () => {
	try {
		await mongoose.connect(SETTINGS.DB_HOST, {
			auth: {
				username: SETTINGS.DB_USER,
				password: SETTINGS.DB_PASS,
			},
			dbName: SETTINGS.DB_NAME,
		});
	} catch (e) {
		await mongoose.disconnect();
	}
};
