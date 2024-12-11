import express from 'express';
import cookieParser from 'cookie-parser';
import { ROUTERS_PATH } from './constants';
import { blogsRouter } from './modules/blogs/blogs.router';
import { postsRouter } from './modules/posts/posts.router';
import { usersRouter } from './modules/users/users.router';
import { authRouter } from './modules/auth/auth.router';
import { testingRouter } from './modules/testing/testing.router';
import { commentsRouter } from './modules/comments/comments.router';
import { securityDevicesRouter } from './modules/securityDevices/securityDevices.router';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.use(ROUTERS_PATH.BLOGS, blogsRouter);
app.use(ROUTERS_PATH.POSTS, postsRouter);
app.use(ROUTERS_PATH.USERS, usersRouter);
app.use(ROUTERS_PATH.AUTH, authRouter);
app.use(ROUTERS_PATH.COMMENTS, commentsRouter);
app.use(ROUTERS_PATH.SECURITY_DEVICES, securityDevicesRouter);
app.use(ROUTERS_PATH.TESTING, testingRouter);
