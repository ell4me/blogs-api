import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { BlogViewDto, BlogCreateDto, BlogUpdateDto } from '../src/modules/blogs/blogs.dto';
import { PostCreateDto } from '../src/modules/posts/posts.dto';

describe(ROUTERS_PATH.BLOGS, () => {
	let newBlog: BlogViewDto | null = null;

	beforeAll(async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.TESTING}/all-data`)
			.expect(HTTP_STATUSES.NO_CONTENT_204);
	});

	it('GET blogs are equal an empty array', async () => {
		await request(app).get(ROUTERS_PATH.BLOGS).expect([]);
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

		await request(app).get(ROUTERS_PATH.BLOGS).expect([]);
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

		await request(app).get(ROUTERS_PATH.BLOGS).expect([newBlog]);
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

		newBlog = { ...newBlog!, ...updatedDataBlog }

		await request(app)
			.get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.expect(newBlog);
	});

	it('DELETE won`t be to delete with incorrect credentials', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.BLOGS}/randomId`)
			.auth('randomUser', 'randomPassword')
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('DELETE blog by id and check that posts will be deleted by concrete blog id', async () => {
		const createPostDto: PostCreateDto = {
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

		await request(app)
			.get(ROUTERS_PATH.POSTS)
			.expect([responsePost.body]);

		await request(app)
			.delete(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.get(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.expect(HTTP_STATUSES.NOT_FOUND_404);

		await request(app)
			.get(ROUTERS_PATH.POSTS)
			.expect([]);
	});

	it('DELETE blog by incorrect id', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.BLOGS}/${newBlog!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});
});
