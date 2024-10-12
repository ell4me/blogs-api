import { Router } from 'express';
import { videosService } from './videos.service';
import { ReqBody, ReqBodyWithParams, ReqParams } from '../../types';
import { VideoCreateDto, VideoUpdateDto } from './videos.dto';
import { validateFields } from './helpers/validateFields';
import { isISOString } from './helpers/isISOString';
import { HTTP_STATUSES } from '../../constants';
import { VALIDATION_MESSAGES } from './constants';

const videosRouter = Router();

videosRouter.get('/', (req, res) => {
	const videos = videosService.getAllVideos();
	res.send(videos);
});

videosRouter.get('/:id', (req: ReqParams<{ id: string }>, res) => {
	const video = videosService.getVideoById(Number(req.params.id));

	if (!video) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	res.send(video);
});

videosRouter.post('/', ({ body: newVideo }: ReqBody<VideoCreateDto>, res) => {
	const errors = validateFields(newVideo);

	if (!!errors.errorsMessages.length) {
		res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
		return;
	}

	const video = videosService.createVideo(newVideo);
	res.status(HTTP_STATUSES.CREATED_201).send(video);
});

videosRouter.put('/:id', (req: ReqBodyWithParams<{ id: string }, VideoUpdateDto>, res) => {
	const idToNumber = Number(req.params.id);
	const videoById = videosService.getVideoById(idToNumber);

	if (!videoById) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	const updatedDataVideo = req.body;
	const errors = validateFields(updatedDataVideo);

	if (updatedDataVideo.canBeDownloaded !== undefined && typeof updatedDataVideo.canBeDownloaded !== 'boolean') {
		errors.errorsMessages.push({
			field: 'canBeDownloaded',
			message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('boolean'),
		});
	}

	if (!isISOString(updatedDataVideo.publicationDate)) {
		errors.errorsMessages.push({
			field: 'publicationDate',
			message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('ISO string'),
		});
	}

	if(updatedDataVideo.minAgeRestriction !== undefined && updatedDataVideo.minAgeRestriction !== null) {
		if (typeof updatedDataVideo.minAgeRestriction !== 'number') {
			errors.errorsMessages.push({
				field: 'minAgeRestriction',
				message: VALIDATION_MESSAGES.FIELD_INVALID_TYPE('number'),
			});
		} else if (updatedDataVideo.minAgeRestriction < 1 || updatedDataVideo.minAgeRestriction > 18) {
			errors.errorsMessages.push({
				field: 'minAgeRestriction',
				message: VALIDATION_MESSAGES.FIELD_RANGE,
			});
		}
	}


	if (!!errors.errorsMessages.length) {
		res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
		return;
	}

	videosService.updateVideoById(idToNumber, updatedDataVideo);
	res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

videosRouter.delete('/:id', (req: ReqParams<{ id: string }>, res) => {
	const isDeleted = videosService.deleteVideoById(Number(req.params.id));

	if (!isDeleted) {
		res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
		return;
	}

	res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

export { videosRouter };
