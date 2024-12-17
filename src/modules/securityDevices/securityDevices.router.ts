import { Router } from 'express';

import { refreshTokenMiddleware } from '../../middlewares/refreshToken.middleware';
import { securityDevicesController } from './securityDevices.controller';

export const securityDevicesRouter = Router();

securityDevicesRouter.get(
	'/',
	refreshTokenMiddleware,
	securityDevicesController.getActiveDeviceSessions.bind(securityDevicesController),
);

securityDevicesRouter.delete(
	'/',
	refreshTokenMiddleware,
	securityDevicesController.deleteAllDeviceSessionsExceptCurrent.bind(securityDevicesController),
);

securityDevicesRouter.delete(
	'/:deviceId',
	refreshTokenMiddleware,
	securityDevicesController.deleteSessionByDeviceId.bind(securityDevicesController),
);
