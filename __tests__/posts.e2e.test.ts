import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ItemsPaginationViewDto, ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { PostCreateByBlogIdDto, PostUpdateDto, PostViewDto } from '../src/modules/posts/posts.dto';
import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from '../src/modules/blogs/blogs.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AuthLoginDto } from '../src/modules/auth/auth.dto';
import { UserViewDto } from '../src/modules/users/users.dto';

const emptyResponse: ItemsPaginationViewDto = {
	page: 1,
	pagesCount: 0,
	pageSize: 10,
	totalCount: 0,
	items: [],
};

const createUserDto = {
	login: 'ell4me',
	email: 'ell4me@gmail.com',
	password: 'qwerty',
};

describe(ROUTERS_PATH.POSTS, () => {
	let newPost: PostViewDto | null = null;
	let newBlog: BlogViewDto | null = null;
	let accessToken: string;
	let currentUser: UserViewDto;
	let server: MongoMemoryServer;

	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		const uri = server.getUri();
		await mongoose.connect(uri);

		const responseUser = await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createUserDto);

		const responseLogin = await request(app)
			.post(`${ROUTERS_PATH.AUTH}/login`)
			.send({
				loginOrEmail: createUserDto.login,
				password: createUserDto.password,
			} as AuthLoginDto);

		accessToken = responseLogin.body.accessToken;
		currentUser = responseUser.body;
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
		await server.stop();
	});

	it('GET posts are equal an empty response', async () => {
		await request(app).get(ROUTERS_PATH.POSTS).expect(emptyResponse);
	});

	it('GET posts should pass pagination queries to response', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/?pageSize=2&pageNumber=2&sortDirection=desc&sortBy=name`)
			.expect({
				...emptyResponse,
				pageSize: 2,
				page: 2,
			});
	});

	it('POST won`t be to create with incorrect credentials', async () => {
		await request(app)
			.post(ROUTERS_PATH.POSTS)
			.auth('randomUser', 'randomPassword')
			.send({})
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST won`t be create with incorrect data: title, content, shortDescription and blogId', async () => {
		await request(app)
			.post(ROUTERS_PATH.POSTS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				title: 'Toooooooooooooooooooooooooooo long',
				shortDescription: '',
				content: 4,
				blogId: 'ewfewf',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'title',
						message: VALIDATION_MESSAGES.LENGTH({ maxLength: 30 }),
					},
					{
						field: 'shortDescription',
						message: VALIDATION_MESSAGES.FIELD_EMPTY,
					},
					{
						field: 'content',
						message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'),
					},
				],
			} as ValidationErrorViewDto);

		await request(app).get(ROUTERS_PATH.POSTS).expect(emptyResponse);
	});

	it('POST will be create post', async () => {
		const createBlogDto: BlogCreateDto = {
			name: 'Dogs',
			websiteUrl: 'https://dogs.com',
			description: 'Some desc',
		};

		const responseBlog = await request(app)
			.post(ROUTERS_PATH.BLOGS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createBlogDto)
			.expect(HTTP_STATUSES.CREATED_201);

		newBlog = responseBlog.body;

		const createPostDto: PostCreateByBlogIdDto = {
			title: 'How live if you are dog?',
			content: 'Some content',
			shortDescription: 'Some short description',
			blogId: newBlog!.id,
		};

		const responsePost = await request(app)
			.post(ROUTERS_PATH.POSTS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createPostDto)
			.expect(HTTP_STATUSES.CREATED_201);

		newPost = responsePost.body;

		expect(newPost).toMatchObject(createPostDto);

		await request(app)
			.get(ROUTERS_PATH.POSTS)
			.expect({
				page: 1,
				pagesCount: 1,
				pageSize: 10,
				totalCount: 1,
				items: [newPost],
			});
	});

	it('GET post with incorrect id', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/randomId`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('GET post by id', async () => {
		await request(app).get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`).expect(newPost!);
	});

	it('PUT won`t be to update with incorrect credentials', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/randomId`)
			.auth('randomUser', 'randomPassword')
			.send({})
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('PUT post by id with incorrect id', async () => {
		const updatedDataPost: PostUpdateDto = {
			title: 'Some title',
			blogId: newBlog!.id,
			shortDescription: 'desc',
			content: 'content',
		};

		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/randomId}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(updatedDataPost)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('PUT post by id with incorrect data', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				...newPost,
				blogId: 'efewf',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'blogId',
						message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
					},
				],
			} as ValidationErrorViewDto);

		await request(app).get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`).expect(newPost!);
	});

	it('PUT post by id with correct data', async () => {
		const updatedDataPost: PostUpdateDto = {
			title: 'Updated title',
			blogId: newBlog!.id,
			content: 'Updated Content',
			shortDescription: newPost!.shortDescription,
		};

		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				...newPost,
				...updatedDataPost,
			})
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		newPost = { ...newPost!, ...updatedDataPost };

		await request(app).get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`).expect(newPost);
	});

	it('If update blog name, post will return correct blog name', async () => {
		const updatedDataBlog: BlogUpdateDto = {
			name: 'Updated name',
			description: 'Updated desc',
			websiteUrl: newBlog!.websiteUrl,
		};

		await request(app)
			.put(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(updatedDataBlog)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.expect({
				...newPost!,
				blogName: updatedDataBlog.name,
			});

		newPost!.blogName = updatedDataBlog.name;
	});

	it('POST like status wrong access token', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}/like-status`)
			.auth('test', { type: 'bearer' })
			.send({ likeStatus: '' })
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST like status should return error if payload is incorrect', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send({ likeStatus: '' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'likeStatus',
						message: VALIDATION_MESSAGES.FIELD_EMPTY,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST like status when post is not found', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/randomPost/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send({ likeStatus: 'test' })
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('POST like status when likeStatus is wrong status', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send({ likeStatus: 'test' })
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'likeStatus',
						message: VALIDATION_MESSAGES.LIKE_STATUS,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST like status should update status', async () => {
		const likeStatus = 'Like';
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send({ likeStatus })
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		const responsePost = await request(app)
			.get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.auth(accessToken, { type: 'bearer' });

		expect(responsePost.body).toEqual({
			...newPost,
			extendedLikesInfo: {
				likesCount: 1,
				dislikesCount: 0,
				newestLikes: [
					{
						login: currentUser.login,
						userId: currentUser.id,
						addedAt: expect.any(String),
					},
				],
				myStatus: likeStatus,
			},
		} as PostViewDto);
	});

	it('GET post and all posts with auth and without to look how like status should change', async () => {
		const extendedLikesInfo = {
			likesCount: 1,
			dislikesCount: 0,
			newestLikes: [
				{
					login: currentUser.login,
					userId: currentUser.id,
					addedAt: expect.any(String),
				},
			],
			myStatus: 'Like',
		};

		const allPostsResponse: ItemsPaginationViewDto<PostViewDto> = {
			pageSize: 10,
			page: 1,
			totalCount: 1,
			pagesCount: 1,
			items: [
				{
					...newPost!,
					extendedLikesInfo: { ...extendedLikesInfo, myStatus: 'None' },
				},
			],
		};

		const responsePost = await request(app).get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`);

		expect(responsePost.body).toEqual({
			...newPost,
			extendedLikesInfo: { ...extendedLikesInfo, myStatus: 'None' },
		} as PostViewDto);

		const responseAllPostsNoAuth = await request(app).get(`${ROUTERS_PATH.POSTS}/`);

		expect(responseAllPostsNoAuth.body).toEqual(allPostsResponse);

		const responseAllPostsWithAuth = await request(app)
			.get(`${ROUTERS_PATH.POSTS}/`)
			.auth(accessToken, { type: 'bearer' });

		expect(responseAllPostsWithAuth.body).toEqual({
			...allPostsResponse,
			items: [
				{
					...allPostsResponse.items[0],
					extendedLikesInfo: {
						...allPostsResponse.items[0].extendedLikesInfo,
						myStatus: 'Like',
					},
				},
			],
		});
	});

	it('POST like status should update status to Dislike', async () => {
		const likeStatus = 'Dislike';
		await request(app)
			.put(`${ROUTERS_PATH.POSTS}/${newPost!.id}/like-status`)
			.auth(accessToken, { type: 'bearer' })
			.send({ likeStatus })
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		const responsePost = await request(app)
			.get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.auth(accessToken, { type: 'bearer' });

		expect(responsePost.body).toEqual({
			...newPost,
			extendedLikesInfo: {
				likesCount: 0,
				dislikesCount: 1,
				newestLikes: [],
				myStatus: likeStatus,
			},
		} as PostViewDto);
	});

	it('DELETE won`t be to delete with incorrect credentials', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.POSTS}/randomId`)
			.auth('randomUser', 'randomPassword')
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('DELETE post by id', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NO_CONTENT_204);
		await request(app)
			.get(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('DELETE post by incorrect id', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.POSTS}/${newPost!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});
});
