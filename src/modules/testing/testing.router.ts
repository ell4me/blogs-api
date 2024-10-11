import { Router } from 'express';
import { videosService } from '../videos/videos.service';

const testingRouter = Router();

testingRouter.delete('/all-data', (req, res) => {
	videosService.deleteAllVideos();
	res.send(204);
});

export { testingRouter };
