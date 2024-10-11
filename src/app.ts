import express from 'express';
import { ROUTERS_PATH } from './constants';
import { videosRouter } from './modules/videos/videos.router';
import { testingRouter } from './modules/testing/testing.router';

const app = express();

express.json();
express.urlencoded({ extended: true });

app.use(ROUTERS_PATH.VIDEOS, videosRouter);
app.use(ROUTERS_PATH.TESTING, testingRouter);

export { app };
