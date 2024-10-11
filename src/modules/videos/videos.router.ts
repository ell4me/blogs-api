import { Router } from 'express';
import { videosService } from './videos.service';
import { ReqBody, ValidationErrorViewDto } from '../../types';
import { VideoCreateDto } from './videos.dto';

const videosRouter = Router();

videosRouter.get('/', (req, res) => {
	const videos = videosService.getAllVideos();
	res.send(videos);
});

videosRouter.post('/', ({ body: newVideo }: ReqBody<VideoCreateDto>, res) => {
	const errors: ValidationErrorViewDto = {errorsMessages: []};

	if(typeof newVideo.title !== 'string') {
		errors.errorsMessages.push({field: 'title', message: 'Title must be a string'})
	}

	if(!newVideo?.title?.trim()) {
		errors.errorsMessages.push({field: 'title', message: 'Title must be not empty'})
	}

	if(newVideo.title.length > 40) {
		errors.errorsMessages.push({field: 'title', message: 'Title must be to have length not more 40 symbols'})
	}

	const videos = videosService.createVideo(newVideo);
	res.status(201).send(videos);
});

export { videosRouter };
