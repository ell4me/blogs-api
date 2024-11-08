import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ItemsPaginationViewDto, ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { runDb } from '../src/helpers/runDb';
import { UserViewDto } from '../src/modules/users/users.dto';

const emptyResponse: ItemsPaginationViewDto = {
	page: 1,
	pagesCount: 0,
	pageSize: 10,
	totalCount: 0,
	items: [],
};

describe(ROUTERS_PATH.USERS, () => {
	let newUser: UserViewDto | null = null;
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

	it('GET users are equal an empty response', async () => {
		await request(app)
			.get(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(emptyResponse);
	});

	it('GET are equal an empty response with passed pageNumber and pageSize', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.USERS}?pageNumber=2&pageSize=5`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect({ ...emptyResponse, page: 2, pageSize: 5 });
	});

	it(`GET should return ${HTTP_STATUSES.UNAUTHORIZED_401} with incorrect credentials`, async () => {
		await request(app)
			.get(ROUTERS_PATH.USERS)
			.auth('randomLogin', 'randomPassword')
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it(`POST should return ${HTTP_STATUSES.UNAUTHORIZED_401} with incorrect credentials`, async () => {
		await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth('randomLogin', 'randomPassword')
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST should`t create user with incorrect data', async () => {
		await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				login: 'qq',
				email: 'wrong email pattern',
				password: '24',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'login',
						message: VALIDATION_MESSAGES.LENGTH(10, 3),
					},
					{
						field: 'password',
						message: VALIDATION_MESSAGES.LENGTH(20, 6),
					},
					{ field: 'email', message: VALIDATION_MESSAGES.FIELD_IS_NOT_MATCH('email') },
				],
			} as ValidationErrorViewDto);
	});

	it('POST should create user', async () => {
		const result = await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				login: 'ell4me',
				email: 'ell4me@gmail.com',
				password: 'qwerty',
			})
			.expect(HTTP_STATUSES.CREATED_201);

		newUser = result.body;

		await request(app)
			.get(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect({ ...emptyResponse, pagesCount: 1, totalCount: 1, items: [newUser] });
	});

	it('POST should`t create user with the same login or email that already is exist', async () => {
		await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send({
				login: 'ell4me',
				email: 'ell4me@gmail.com',
				password: 'qwerty',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, [{
				field: 'email',
				message: VALIDATION_MESSAGES.FIELD_IS_EXIST('email'),
			}]);

		await request(app)
			.get(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect({ ...emptyResponse, pagesCount: 1, totalCount: 1, items: [newUser] });
	});

	it('GET users with searchLoginTerm and searchEmailTerm', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.USERS}?searchLoginTerm=el&searchEmailTerm=23`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect({...emptyResponse, pagesCount: 1, totalCount: 1, items: [newUser]});
	});

	it('GET should return empty users with searchLoginTerm and searchEmailTerm', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.USERS}?searchLoginTerm=324&searchEmailTerm=23`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(emptyResponse);
	});

	it('DELETE should delete user', async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.USERS}/${newUser!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.get(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(emptyResponse);
	});

	it(`DELETE should return ${HTTP_STATUSES.NOT_FOUND_404} if user is not exist`, async () => {
		await request(app)
			.delete(`${ROUTERS_PATH.USERS}/${newUser!.id}`)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.expect(HTTP_STATUSES.NOT_FOUND_404);
	});
});
