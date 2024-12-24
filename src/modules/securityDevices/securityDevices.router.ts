import { Router } from 'express';

import { refreshTokenMiddleware } from '../../middlewares/refreshToken.middleware';
import { compositionRoot } from '../../inversify.config';
import { SecurityDevicesController } from './securityDevices.controller';

const securityDevicesController = compositionRoot.resolve(SecurityDevicesController);
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
