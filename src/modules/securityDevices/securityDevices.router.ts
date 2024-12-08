import { Router } from 'express';

import { securityDevicesQueryRepository } from './securityDevices.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { refreshTokenMiddleware } from '../../middlewares/refreshToken.middleware';
import { ReqParams } from '../../types';
import { securityDevicesService } from './securityDevices.service';


export const securityDevicesRouter = Router();

securityDevicesRouter.get('/', refreshTokenMiddleware, async (req, res) => {
	try {
		const activeDeviceSessions = await securityDevicesQueryRepository.getActiveDeviceSessions(req.user.id!);
		res.send(activeDeviceSessions);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

securityDevicesRouter.delete('/', refreshTokenMiddleware, async (req, res) => {
	try {
		await securityDevicesService.deleteAllDeviceSessionsExceptCurrent(req.user.id!, req.user.deviceId!);

		res.send(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

securityDevicesRouter.delete('/:deviceId', refreshTokenMiddleware, async (req: ReqParams<{
	deviceId: string
}>, res) => {
	try {
		if (req.params.deviceId !== req.user.deviceId) {
			res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
			return;
		}

		const isDeleted = await securityDevicesService.deleteSessionByDeviceId(req.params.deviceId);

		if (!isDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
