import { app } from './app';
import { SETTINGS } from './constants';
import { runDb } from './helpers/runDb';

(async () => {
	await runDb();
	app.listen(SETTINGS.PORT, () => {
		console.log(`Server is starting on http://localhost:${SETTINGS.PORT}`);
	});
})();
