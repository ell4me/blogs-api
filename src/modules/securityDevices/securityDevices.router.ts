import { Router } from 'express';

import { refreshTokenMiddleware } from '../../middlewares/refreshToken.middleware';
import { securityDevicesController } from './securityDevices.controller';

export const securityDevicesRouter = Router();

securityDevicesRouter.get(
	'/',
	refreshTokenMiddleware,
	securityDevicesController.getActiveDeviceSessions,
);

securityDevicesRouter.delete(
	'/',
	refreshTokenMiddleware,
	securityDevicesController.deleteAllDeviceSessionsExceptCurrent,
);

securityDevicesRouter.delete(
	'/:deviceId',
	refreshTokenMiddleware,
	securityDevicesController.deleteSessionByDeviceId,
);
