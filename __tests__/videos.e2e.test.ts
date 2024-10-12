import { HTTP_STATUSES, ROUTERS_PATH } from '../src/constants';
import request from 'supertest';
import { app } from '../src/app';
import { VideoViewDto } from '../src/modules/videos/videos.dto';
import { ValidationErrorViewDto } from '../src/types';
import { VALIDATION_MESSAGES } from '../src/modules/videos/constants';

describe(ROUTERS_PATH.VIDEOS, () => {
	let newVideo: VideoViewDto | null = null;

	beforeAll(async () => {
		await request(app).delete(`${ROUTERS_PATH.TESTING}/all-data`).expect(HTTP_STATUSES.NO_CONTENT_204);
	});

	afterAll(done => {
		done();
	});

	it('GET videos are equal an empty array', async () => {
		await request(app).get(ROUTERS_PATH.VIDEOS).expect([]);
	});

	it('POST won`t be create with incorrect data: title, author and availableResolutions', async () => {

		await request(app).post(ROUTERS_PATH.VIDEOS).send({
			title: '  ',
			author: 3,
			availableResolutions: ['P240', 'fsdf'],
		}).expect(HTTP_STATUSES.BAD_REQUEST_400, {
			errorsMessages: [{
				field: 'title',
				message: VALIDATION_MESSAGES.FIELD_EMPTY,
			}, {
				field: 'author',
				message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('string'),
			}, { field: 'availableResolutions', message: VALIDATION_MESSAGES.AVAILABLE_RESOLUTIONS }],
		} as ValidationErrorViewDto);

		await request(app).get(ROUTERS_PATH.VIDEOS).expect([]);
	});


	it('POST will be create video', async () => {
		const createVideoDto = {
			title: 'Cat',
			author: 'Ivan',
			availableResolutions: ['P240'],
		};
		const response = await request(app).post(ROUTERS_PATH.VIDEOS).send(createVideoDto).expect(HTTP_STATUSES.CREATED_201);

		newVideo = response.body;

		expect(newVideo).toMatchObject(createVideoDto);

		await request(app).get(ROUTERS_PATH.VIDEOS).expect([newVideo]);
	});

	it('GET video with incorrect id', async () => {
		await request(app).get(`${ROUTERS_PATH.VIDEOS}/randomId`).expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('GET video by id', async () => {
		await request(app).get(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).expect(newVideo!);
	});

	it('PUT video by id with incorrect id', async () => {
		await request(app).put(`${ROUTERS_PATH.VIDEOS}/randomId}`).expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('PUT video by id with incorrect data', async () => {
		await request(app).put(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).send({
			...newVideo,
			minAgeRestriction: 0,
		}).expect(HTTP_STATUSES.BAD_REQUEST_400, {
			errorsMessages: [{
				field: 'minAgeRestriction',
				message: VALIDATION_MESSAGES.FIELD_RANGE,
			}],
		} as ValidationErrorViewDto);

		await request(app).get(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).expect(newVideo!);
	});

	it('PUT video by id with correct data', async () => {
		const updatedDataVideo = {
			title: 'Nik',
			availableResolutions: ['P480', 'P720', 'P1080', 'P1440', 'P2160'],
			canBeDownloaded: true,
		};

		await request(app).put(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).send({
			...newVideo,
			...updatedDataVideo,
		}).expect(HTTP_STATUSES.NO_CONTENT_204);

		await request(app).get(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).expect({...newVideo, ...updatedDataVideo});
	});

	it('DELETE video by id', async () => {
		await request(app).delete(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).expect(HTTP_STATUSES.NO_CONTENT_204);
		await request(app).get(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).expect(HTTP_STATUSES.NOT_FOUND_404);
	});

	it('DELETE video by incorrect id', async () => {
		await request(app).delete(`${ROUTERS_PATH.VIDEOS}/${newVideo!.id}`).expect(HTTP_STATUSES.NOT_FOUND_404);
	});
});