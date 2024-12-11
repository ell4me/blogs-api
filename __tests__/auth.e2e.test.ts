import { HTTP_STATUSES, ROUTERS_PATH, SETTINGS } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
	AuthLoginDto,
	CurrentUserViewDto,
	RegistrationConfirmationDto,
	RegistrationEmailResendingDto,
} from '../src/modules/auth/auth.dto';
import { UserCreateDto, UserViewDto } from '../src/modules/users/users.dto';
import { usersRepository } from '../src/modules/users/users.repository';
import { add } from 'date-fns/add';
import mongoose from 'mongoose';
import { UserDocument } from '../src/modules/users/users.model';

const createUserDto = {
	login: 'ell4me',
	email: 'ell4me@gmail.com',
	password: 'qwerty',
};

describe(ROUTERS_PATH.AUTH, () => {
	let server: MongoMemoryServer;
	let newUser: UserViewDto;
	let registeredUser: UserDocument | null;
	let accessToken: string;
	let cookiesWithRefreshToken: string;
	let updatedCookiesWithRefreshToken: string;

	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		const uri = server.getUri();
		await mongoose.connect(uri);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
		await server.stop();
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
						message: VALIDATION_MESSAGES.FIELD_EMPTY,
					},
					{
						field: 'password',
						message: VALIDATION_MESSAGES.FIELD_EMPTY,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST should login', async () => {
		const responseUser = await request(app)
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

		cookiesWithRefreshToken = responseLogin.headers['set-cookie'];
		newUser = responseUser.body;
		accessToken = responseLogin.body.accessToken;

		expect(responseLogin.body).toMatchObject({ accessToken: expect.any(String) });
	});

	it('POST don`t refresh token if it won`t be in cookies', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/refresh-token`)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST should refresh token', async () => {
		const response = await request(app)
			.post(`${ROUTERS_PATH.AUTH}/refresh-token`)
			.set('Cookie', cookiesWithRefreshToken);

		accessToken = response.body.accessToken;
		updatedCookiesWithRefreshToken = response.headers['set-cookie'];

		expect(response.body).toMatchObject({ accessToken: expect.any(String) });
	});

	it('POST should`t refresh token with revoked token', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/refresh-token`)
			.set('Cookie', cookiesWithRefreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST don`t logout if refreshToken won`t be in cookies', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/logout`)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('POST should logout', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/logout`)
			.set('Cookie', updatedCookiesWithRefreshToken)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/logout`)
			.set('Cookie', updatedCookiesWithRefreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/refresh-token`)
			.set('Cookie', updatedCookiesWithRefreshToken)
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('GET should`t get info about user', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.AUTH}/me`)
			.auth('randomToken', { type: 'bearer' })
			.expect(HTTP_STATUSES.UNAUTHORIZED_401);
	});

	it('GET should get info about user', async () => {
		await request(app)
			.get(`${ROUTERS_PATH.AUTH}/me`)
			.auth(accessToken, { type: 'bearer' })
			.expect({
				userId: newUser.id,
				login: newUser.login,
				email: newUser.email,
			} as CurrentUserViewDto);
	});

	it('POST shouldn`t register user with wrong data', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration`)
			.send({
				login: 'qq',
				email: 'wrong email pattern',
				password: '24',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'login',
						message: VALIDATION_MESSAGES.LENGTH({ maxLength: 10, minLength: 3 }),
					},
					{
						field: 'password',
						message: VALIDATION_MESSAGES.LENGTH({ maxLength: 20, minLength: 6 }),
					},
					{ field: 'email', message: VALIDATION_MESSAGES.FIELD_IS_NOT_MATCH('email') },
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t register user with already exist login', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration`)
			.send({
				...createUserDto,
				email: 'newEmail@gmail.com',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'login',
						message: VALIDATION_MESSAGES.FIELD_IS_EXIST('login'),
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t register user with already exist email', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration`)
			.send(createUserDto)
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'email',
						message: VALIDATION_MESSAGES.FIELD_IS_EXIST('email'),
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST should register user', async () => {
		const registrationUserDto = {
			login: 'test',
			email: 'test@gmail.com',
			password: 'qwerty',
		};

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration`)
			.send(registrationUserDto)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		const users = await request(app)
			.get(ROUTERS_PATH.USERS)
			.auth(SETTINGS.LOGIN, SETTINGS.PASSWORD);

		expect(users.body.items[0]).toMatchObject({
			login: registrationUserDto.login,
			email: registrationUserDto.email,
		});

		registeredUser = await usersRepository.getUserByEmailOrLogin({ email: 'test@gmail.com' });
	});

	it('POST shouldn`t confirm email when code is empty', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-confirmation`)
			.send({
				code: '',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'code',
						message: VALIDATION_MESSAGES.FIELD_EMPTY,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t confirm email when code is incorrect', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-confirmation`)
			.send({
				code: 'qwe',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'code',
						message: VALIDATION_MESSAGES.CONFIRMATION_CODE_IS_NOT_CORRECT,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t confirm email when code expired', async () => {
		await usersRepository.updateUserEmailConfirmation(registeredUser!.id, {
			...registeredUser!.emailConfirmation,
			expiration: new Date().getTime(),
		});

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-confirmation`)
			.send({
				code: registeredUser!.emailConfirmation.code,
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'code',
						message: VALIDATION_MESSAGES.CONFIRMATION_CODE_EXPIRED,
					},
				],
			} as ValidationErrorViewDto);

		await usersRepository.updateUserEmailConfirmation(registeredUser!.id, {
			...registeredUser!.emailConfirmation,
			expiration: add(new Date(), { hours: 1 }).getTime(),
		});
	});

	it('POST should confirm email', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-confirmation`)
			.send({
				code: registeredUser!.emailConfirmation.code,
			})
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-confirmation`)
			.send({
				code: registeredUser!.emailConfirmation.code,
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'code',
						message: VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t resending email, when email is not valid', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-email-resending`)
			.send({
				email: 'test',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'email',
						message: VALIDATION_MESSAGES.FIELD_IS_NOT_MATCH('email'),
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t resending email, when user is not found', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-email-resending`)
			.send({
				email: 'qwe@gmail.com',
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'email',
						message: VALIDATION_MESSAGES.USER_IS_NOT_FOUND,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST shouldn`t resending email, when user confirmed', async () => {
		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-email-resending`)
			.send({
				email: registeredUser!.email,
			})
			.expect(HTTP_STATUSES.BAD_REQUEST_400, {
				errorsMessages: [
					{
						field: 'email',
						message: VALIDATION_MESSAGES.USER_ALREADY_CONFIRMED,
					},
				],
			} as ValidationErrorViewDto);
	});

	it('POST should resending email', async () => {
		const registrationUserDto = {
			login: 'QWE',
			email: 'QWE@gmail.com',
			password: 'qwerty',
		};

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration`)
			.send(registrationUserDto)
			.expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app)
			.post(`${ROUTERS_PATH.AUTH}/registration-email-resending`)
			.send({
				email: registrationUserDto.email,
			})
			.expect(HTTP_STATUSES.NO_CONTENT_204);
	});

	describe('Rate limit', () => {
		beforeAll(async () => {
			await request(app)
				.delete(`${ROUTERS_PATH.TESTING}/all-data`)
				.expect(HTTP_STATUSES.NO_CONTENT_204);
		});

		it('POST login should return 429 after 5 attempts', async () => {
			const payload: AuthLoginDto = {
				loginOrEmail: '',
				password: '',
			};

			for (let i = 0; i < 5; i++) {
				await request(app)
					.post(`${ROUTERS_PATH.AUTH}/login`)
					.send(payload)
					.expect(HTTP_STATUSES.BAD_REQUEST_400);
			}

			await request(app)
				.post(`${ROUTERS_PATH.AUTH}/login`)
				.send(payload)
				.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
		});

		it('POST registration should return 429 after 5 attempts', async () => {
			const payload: UserCreateDto = {
				login: '',
				email: '',
				password: '',
			};

			for (let i = 0; i < 5; i++) {
				await request(app)
					.post(`${ROUTERS_PATH.AUTH}/registration`)
					.send(payload)
					.expect(HTTP_STATUSES.BAD_REQUEST_400);
			}

			await request(app)
				.post(`${ROUTERS_PATH.AUTH}/registration`)
				.send(payload)
				.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
		});

		it('POST registration-confirmation should return 429 after 5 attempts', async () => {
			const payload: RegistrationConfirmationDto = {
				code: '',
			};

			for (let i = 0; i < 5; i++) {
				await request(app)
					.post(`${ROUTERS_PATH.AUTH}/registration-confirmation`)
					.send(payload)
					.expect(HTTP_STATUSES.BAD_REQUEST_400);
			}

			await request(app)
				.post(`${ROUTERS_PATH.AUTH}/registration`)
				.send(payload)
				.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
		});

		it('POST registration-email-resending should return 429 after 5 attempts', async () => {
			const payload: RegistrationEmailResendingDto = {
				email: '',
			};

			for (let i = 0; i < 5; i++) {
				await request(app)
					.post(`${ROUTERS_PATH.AUTH}/registration-email-resending`)
					.send(payload)
					.expect(HTTP_STATUSES.BAD_REQUEST_400);
			}

			await request(app)
				.post(`${ROUTERS_PATH.AUTH}/registration`)
				.send(payload)
				.expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
		});
	});
});
