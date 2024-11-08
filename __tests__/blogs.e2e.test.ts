import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import { app } from '../src/app';
import { ItemsPaginationViewDto, ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { BlogViewDto, BlogCreateDto, BlogUpdateDto } from '../src/modules/blogs/blogs.dto';
import { PostCreateByBlogIdDto, PostCreateDto } from '../src/modules/posts/posts.dto';
import { runDb } from '../src/helpers/runDb';
import { MongoClient } from 'mongodb';

const emptyResponse: ItemsPaginationViewDto = {
	page: 1,
	pagesCount: 0,
	pageSize: 10,
	totalCount: 0,
	items: [],
};

describe(ROUTERS_PATH.BLOGS, () => {
	let newBlog: BlogViewDto | null = null;
	let server: MongoMemoryServer;
	let clientDb: MongoClient;

	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		const uri = server.getUri();
		clientDb = new MongoClient(uri);

		await runDb(clientDb);
		await request(app)
			.delete(`${ROUTERS_PATH.TESTING}/all-data`)
			.expect(HTTP_STATUSES.NO_CONTENT_204);
	});

	afterAll(async () => {
		await server.stop();
		await clientDb.close();
	});

	it('GET blogs are equal an empty response', async () => {
		await request(app).get(ROUTERS_PATH.BLOGS).expect(emptyResponse);
	});

	it('GET blogs should pass pagination queries to response', async () => {
		await request(app).get(`${ROUTERS_PATH.BLOGS}?pageSize=5&pageNumber=2&sortDirection=desc&sortBy=name`).expect({
			...emptyResponse,
			pageSize: 5,
			page: 2,
		});
	});


	it('GET posts with incorrect blog id', async () => {
		await request(app).get(`${ROUTERS_PATH.BLOGS}/someId/posts`).expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('POST won`t be to create with incorrect credentials', async () => {
		await request(app)
			.post(ROUTERS_PATH.BLOGS)
			.auth('randomUser', 'randomPassword')
			.send({})
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST won`t be create with incorrect data: name, description and websiteUrl', async () => {
		await request(app)
			.post(ROUTERS_PATH.BLOGS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				name: '',
				description: 4,
				websiteUrl: 'https://fdfd',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'websiteUrl',
						message: VALIDATION_MESSAGES.FIELD_IS_NOT_URL,
					},
					{
						field: 'name',
						message: VALIDATION_MESSAGES.FIELD_EMPTY,
					},
					{
						field: 'description',
						message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'),
					},
				],
			} as ValidationErrorViewDto);

		await request(app).get(ROUTERS_PATH.BLOGS).expect(emptyResponse);
	});

	it('POST will be create blog', async () => {
		const createBlogDto: BlogCreateDto = {
			name: 'Cat',
			description: 'Some desc',
			websiteUrl: 'https://some.com',
		};
		const response = await request(app)
			.post(ROUTERS_PATH.BLOGS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createBlogDto)
			.expect(HTTP_STATUSES.CREATED_201);

		newBlog = response.body;

		expect(newBlog).toMatchObject(createBlogDto);

		await request(app).get(ROUTERS_PATH.BLOGS).expect({
			page: 1,
			pagesCount: 1,
			pageSize: 10,
			totalCount: 1,
			items: [newBlog],
		});
	});

	it(`POST should return ${HTTP_STATUSES.NOT_FOUND_404} status if blog doesn't exist`, async () => {
		await request(app)
			.post(`${ROUTERS_PATH.BLOGS}/randomBlogId/posts`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				title: 'New post',
				content: 'content',
				shortDescription: 'description',
			} as PostCreateDto).expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('POST create post by blog id', async () => {
		const { body: post } = await request(app)
			.post(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}/posts`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				title: 'New post',
				content: 'content',
				shortDescription: 'description',
			} as PostCreateDto).expect(HTTP_STATUSES.CREATED_201);

		await request(app).get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}/posts?pageSize=2`).expect({
			pageSize: 2,
			page: 1,
			pagesCount: 1,
			totalCount: 1,
			items: [post],
		} as ItemsPaginationViewDto);

		await request(app)
			.delete(`${ROUTERS_PATH.POSTS}/${post!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NO_CONTENT_204);
	});

	it('GET blog with incorrect id', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.BLOGS}/randomId`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('GET blog by id', async () => {
		await request(app).get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`).expect(newBlog!);
	});

	it('PUT won`t be to update with incorrect credentials', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.BLOGS}/randomId`)
			.auth('randomUser', 'randomPassword')
			.send({})
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('PUT blog by id with incorrect id', async () => {
		const updatedDataBlog: BlogUpdateDto = {
			name: 'Ivan',
			description: 'Updated desc',
			websiteUrl: newBlog!.websiteUrl,
		};

		await request(app)
			.put(`${ROUTERS_PATH.BLOGS}/randomId}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(updatedDataBlog)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('PUT blog by id with incorrect data', async () => {
		await request(app)
			.put(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				...newBlog,
				name: 0,
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'name',
						message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'),
					},
				],
			} as ValidationErrorViewDto);

		await request(app).get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`).expect(newBlog!);
	});

	it('PUT blog by id with correct data', async () => {
		const updatedDataBlog: BlogUpdateDto = {
			name: 'Ivan',
			description: 'Updated desc',
			websiteUrl: newBlog!.websiteUrl,
		};

		await request(app)
			.put(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(updatedDataBlog)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		newBlog = { ...newBlog!, ...updatedDataBlog };

		await request(app).get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`).expect(newBlog);
	});

	it('DELETE won`t be to delete with incorrect credentials', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.BLOGS}/randomId`)
			.auth('randomUser', 'randomPassword')
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('DELETE blog by id and check that posts will be deleted by concrete blog id', async () => {
		const createPostDto: PostCreateByBlogIdDto = {
			title: 'Some title',
			content: 'Some content',
			shortDescription: 'Some short description',
			blogId: newBlog!.id,
		};

		const responsePost = await request(app)
			.post(ROUTERS_PATH.POSTS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createPostDto)
			.expect(HTTP_STATUSES.CREATED_201);

		await request(app).get(ROUTERS_PATH.POSTS).expect({
			page: 1,
			pagesCount: 1,
			pageSize: 10,
			totalCount: 1,
			items: [responsePost.body],
		});

		await request(app)
			.delete(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);

		await request(app).get(ROUTERS_PATH.POSTS).expect(emptyResponse);
	});

	it('DELETE blog by incorrect id', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});
});
