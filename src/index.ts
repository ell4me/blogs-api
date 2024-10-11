import { app } from './app';
import { SETTINGS } from './constants';

app.listen(SETTINGS.PORT, () => {
	console.log(`Server is starting on http://localhost:${SETTINGS.PORT}`);
});
