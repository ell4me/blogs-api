import { Router } from 'express';
import { videosService } from '../videos/videos.service';

const testingRouter = Router();

testingRouter.delete('/all-data', (req, res) => {
	videosService.deleteAllVideos();
	res.sendStatus(204);
});

export { testingRouter };
