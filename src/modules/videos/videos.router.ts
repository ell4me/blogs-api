import { Router } from 'express';
import { videosService } from './videos.service';
import { ReqBody, ReqBodyWithParams, ReqParams } from '../../types';
import { VideoCreateDto, VideoUpdateDto } from './videos.dto';
import { validateFields } from './helpers/validateFields';
import { isISOString } from './helpers/isISOString';
import { HTTP_STATUSES } from '../../constants';

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
	}

	const videos = videosService.createVideo(newVideo);
	res.status(HTTP_STATUSES.CREATED_201).send(videos);
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

	if (typeof updatedDataVideo.canBeDownloaded !== 'boolean') {
		errors.errorsMessages.push({
			field: 'canBeDownloaded',
			message: `Field must be boolean`,
		});
	}

	if (!isISOString(updatedDataVideo.publicationDate)) {
		errors.errorsMessages.push({
			field: 'publicationDate',
			message: 'Field must be an ISO string',
		});
	}

	if (typeof updatedDataVideo.minAgeRestriction !== 'number') {
		errors.errorsMessages.push({
			field: 'minAgeRestriction',
			message: 'Field must be a number',
		});
	} else if (updatedDataVideo.minAgeRestriction < 1 || updatedDataVideo.minAgeRestriction > 18) {
		errors.errorsMessages.push({
			field: 'minAgeRestriction',
			message: 'Field must be to have value in range from 1 to 18',
		});
	}

	if (!!errors.errorsMessages.length) {
		res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
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
