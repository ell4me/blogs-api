import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ItemsPaginationViewDto, ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { PostCreateByBlogIdDto, PostUpdateDto, PostViewDto } from '../src/modules/posts/posts.dto';
import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from '../src/modules/blogs/blogs.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { runDb } from '../src/helpers/runDb';

const emptyResponse: ItemsPaginationViewDto = {
	page: 1,
	pagesCount: 0,
	pageSize: 10,
	totalCount: 0,
	items: [],
};

describe(ROUTERS_PATH.POSTS, () => {
	let newPost: PostViewDto | null = null;
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

	it('GET posts are equal an empty response', async () => {
		await request(app).get(ROUTERS_PATH.POSTS).expect(emptyResponse);
	});

	it('GET posts should pass pagination queries to response', async () => {
		await request(app).get(`${ROUTERS_PATH.POSTS}/?pageSize=2&pageNumber=2&sortDirection=desc&sortBy=name`).expect({
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
					{
						field: 'blogId',
						message: VALIDATION_MESSAGES.BLOG_IS_NOT_EXIST,
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

		await request(app).get(ROUTERS_PATH.POSTS).expect({
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
