import { app } from './app';
import { SETTINGS } from './constants';
import { runDb } from './helpers/runDb';
import { MongoClient } from 'mongodb';

(async () => {
	const clientDb = new MongoClient(SETTINGS.DB_HOST, {
		auth: { username: SETTINGS.DB_USER, password: SETTINGS.DB_PASS },
	});

	await runDb(clientDb);
	app.listen(SETTINGS.PORT, () => {
		console.log(`Server is starting on http://localhost:${SETTINGS.PORT}`);
	});
})();
