import express from 'express';
import { ROUTERS_PATH } from './constants';
import { blogsRouter } from './modules/blogs/blogs.router';
import { postsRouter } from './modules/posts/posts.router';
import { testingRouter } from './modules/testing/testing.router';

export const app = express();

app.use(express.json());

app.use(ROUTERS_PATH.BLOGS, blogsRouter);
app.use(ROUTERS_PATH.POSTS, postsRouter);
app.use(ROUTERS_PATH.TESTING, testingRouter);
