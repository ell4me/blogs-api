import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ItemsPaginationViewDto, ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthLoginDto } from '../src/modules/auth/auth.dto';
import { BlogCreateDto } from '../src/modules/blogs/blogs.dto';
import { PostCreateByBlogIdDto, PostViewDto } from '../src/modules/posts/posts.dto';
import mongoose from 'mongoose';
import { CommentViewDto } from '../src/modules/comments/comments.dto';

const emptyResponse: ItemsPaginationViewDto = {
	page: 1,
	pagesCount: 0,
	pageSize: 10,
	totalCount: 0,
	items: [],
};

describe(ROUTERS_PATH.COMMENTS, () => {
	let server: MongoMemoryServer;
	let accessToken: string;
	let accessAnotherToken: string;
	let post: PostViewDto;
	let comment: CommentViewDto;

	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		const uri = server.getUri();
		await mongoose.connect(uri);

		const createUserDto = {
			login: 'ell4me',
			email: 'ell4me@gmail.com',
			password: 'qwerty',
		};

		const createAnotherUserDto = {
			login: 'newUser',
			email: '32535@gmail.com',
			password: 'yuuiyt',
		};

		const createBlogDto: BlogCreateDto = {
			name: 'Dogs',
			websiteUrl: 'https://dogs.com',
			description: 'Some desc',
		};

		await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createUserDto)
			.expect(HTTP_STATUSES.CREATED_201);

		const responseLogin = await request(app)
			.post(`${ROUTERS_PATH.AUTH}/login`)
			.send({
				loginOrEmail: createUserDto.login,
				password: createUserDto.password,
			} as AuthLoginDto);

		await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createAnotherUserDto)
			.expect(HTTP_STATUSES.CREATED_201);

		const responseAnotherLogin = await request(app)
			.post(`${ROUTERS_PATH.AUTH}/login`)
			.send({
				loginOrEmail: createAnotherUserDto.login,
				password: createAnotherUserDto.password,
			} as AuthLoginDto);

		const responseBlog = await request(app)
			.post(ROUTERS_PATH.BLOGS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createBlogDto)
			.expect(HTTP_STATUSES.CREATED_201);

		const createPostDto: PostCreateByBlogIdDto = {
			title: 'How live if you are dog?',
			content: 'Some content',
			shortDescription: 'Some short description',
			blogId: responseBlog.body.id,
		};

		const responsePost = await request(app)
			.post(ROUTERS_PATH.POSTS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createPostDto)
			.expect(HTTP_STATUSES.CREATED_201);

		post = responsePost.body;
		accessToken = responseLogin.body.accessToken;
		accessAnotherToken = responseAnotherLogin.body.accessToken;
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
		await server.stop();
	});

	it('GET comments not found by wrond post id', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/randomId/comments`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('GET comments empty response by post id', async () => {
		await request(app).get(`${ROUTERS_PATH.POSTS}/${post.id}/comments`).expect(emptyResponse);
	});

	it('GET comments empty response by post id with pageNumber=2 and pageSize=3', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/${post.id}/comments?pageNumber=2&pageSize=3`)
			.expect({ ...emptyResponse, page: 2, pageSize: 3 });
	});

	it('POST should`t create comment when unauthorized', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.POSTS}/${post.id}/comments`)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST should`t create comment when post id is not found', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.POSTS}/randomId/comments`)
			.auth(accessToken, { type: 'bearer' })
			.send({ content: 'comment comment comment comment' })
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('POST should`t create comment when content is not valid', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.POSTS}/${post.id}/comments`)
			.auth(accessToken, { type: 'bearer' })
			.send({ content: 'comment' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'content',
						message: VALIDATION_MESSAGES.LENGTH({ minLength: 20, maxLength: 300 }),
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST should create comment', async () => {
		const payload = { content: 'comment comment comment comment' };
		const response = await request(app)
			.post(`${ROUTERS_PATH.POSTS}/${post.id}/comments`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.CREATED_201);

		comment = response.body;

		expect(comment).toEqual({
			...payload,
			likesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: 'None',
			},
			id: comment.id,
			createdAt: comment.createdAt,
			commentatorInfo: comment.commentatorInfo,
		} as CommentViewDto);

		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/${post.id}/comments`)
			.expect({
				page: 1,
				pagesCount: 1,
				pageSize: 10,
				totalCount: 1,
				items: [comment],
			});
	});

	it('GET comment by wrong id', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.COMMENTS}/randomId`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('GET comment by id', async () => {
		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should`t update comment when unauthorized', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.send({ content: 'comment' })
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('PUT should`t update comment when comment is not found', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/randomCommentId`)
			.auth(accessToken, { type: 'bearer' })
			.send({ content: 'comment comment comment comment comment' })
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('PUT should`t update comment when content is not valid', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.send({ content: 'updated' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'content',
						message: VALIDATION_MESSAGES.LENGTH({ minLength: 20, maxLength: 300 }),
					},
				],
			} as ValidationErrorViewDto);

		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should`t update comment when this one is not belong to user', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessAnotherToken, { type: 'bearer' })
			.send({ content: 'updated updated updated updated' })
			.expect(HTTP_STATUSES.FORBIDDEN_403);

		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should update comment', async () => {
		const payload = { content: 'updated updated updated updated' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		comment.content = payload.content;

		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should`t change like status when unauthorized', async () => {
		const payload = { likeStatus: 'few' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}/like-status`)
			.send(payload)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);

		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should`t change like status when comment is not found', async () => {
		const payload = { likeStatus: 'few' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/randomId/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.NOT_FOUND_404);

		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should`t change like status when data is not valid', async () => {
		const payload = { likeStatus: 'few' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						message: VALIDATION_MESSAGES.LIKE_STATUS,
						field: 'likeStatus',
					},
				],
			} as ValidationErrorViewDto);

		await request(app).get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`).expect(comment);
	});

	it('PUT should change like status', async () => {
		const payload = { likeStatus: 'Like' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		const likesInfo = { likesCount: 1, dislikesCount: 0, myStatus: 'None' };

		await request(app)
			.get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.expect({
				...comment,
				likesInfo,
			} as CommentViewDto);

		await request(app)
			.get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.expect({
				...comment,
				likesInfo: { ...likesInfo, myStatus: 'Like' },
			} as CommentViewDto);
	});

	it('PUT should change like status on `Dislike` when your status was `Like`', async () => {
		const payload = { likeStatus: 'Dislike' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.expect({
				...comment,
				likesInfo: { likesCount: 0, dislikesCount: 1, myStatus: 'Dislike' },
			} as CommentViewDto);
	});

	it('PUT should change like status on `None`', async () => {
		const payload = { likeStatus: 'None' };
		await request(app)
			.put(`${ROUTERS_PATH.COMMENTS}/${comment.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send(payload)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.get(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.expect({
				...comment,
				likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
			} as CommentViewDto);
	});

	it('DELETE should`t delete comment when unauthorized', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('DELETE should`t delete comment when this one is not belong to user', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessAnotherToken, { type: 'bearer' })
			.expect(HTTP_STATUSES.FORBIDDEN_403);
	});

	it('DELETE should delete comment', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.expect(HTTP_STATUSES.NO_CONTENT_204);
	});

	it('DELETE should return not found', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.COMMENTS}/${comment.id}`)
			.auth(accessToken, { type: 'bearer' })
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});
});
