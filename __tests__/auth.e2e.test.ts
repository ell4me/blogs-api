import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { runDb } from '../src/helpers/runDb';
import { AuthLoginDto } from '../src/modules/auth/auth.dto';

describe(ROUTERS_PATH.USERS, () => {
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

	it('POST should return errorsMessages with incorrect data', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/login`)
			.send({
				loginOrEmail: '',
				password: '',
			} as AuthLoginDto)
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'loginOrEmail',
						message: VALIDATION_MESSAGES.FIELD_EMPTY
					},
					{
						field: 'password',
						message: VALIDATION_MESSAGES.FIELD_EMPTY
					}
				],
			} as ValidationErrorViewDto);
	});

	it('POST should login', async () => {
		const createUserDto = {
			login: 'ell4me',
			email: 'ell4me@gmail.com',
			password: 'qwerty',
		};

		await request(app)
			.post(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD)
			.send(createUserDto)
			.expect(HTTP_STATUSES.CREATED_201);

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/login`)
			.send({
				loginOrEmail: createUserDto.login,
				password: createUserDto.password,
			} as AuthLoginDto)
			.expect(HTTP_STATUSES.NO_CONTENT_204);
	});
});
