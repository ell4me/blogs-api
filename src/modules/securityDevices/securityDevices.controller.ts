import { Request, Response } from 'express';
import { securityDevicesQueryRepository } from './securityDevices.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { securityDevicesService } from './securityDevices.service';
import { ReqParams } from '../../types';

class SecurityDevicesController {
	async getActiveDeviceSessions(req: Request, res: Response) {
		try {
			const activeDeviceSessions =
				await securityDevicesQueryRepository.getActiveDeviceSessions(req.user.id!);
			res.send(activeDeviceSessions);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async deleteAllDeviceSessionsExceptCurrent(req: Request, res: Response) {
		try {
			await securityDevicesService.deleteAllDeviceSessionsExceptCurrent(
				req.user.id!,
				req.user.deviceId!,
			);

			res.send(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async deleteSessionByDeviceId(req: ReqParams<{ deviceId: string }>, res: Response) {
		try {
			const currentDeviceSession = await securityDevicesQueryRepository.getDeviceSession(
				req.params.deviceId!,
			);

			if (!currentDeviceSession) {
				res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
				return;
			}

			if (currentDeviceSession.userId !== req.user.id!) {
				res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
				return;
			}

			await securityDevicesService.deleteSessionByDeviceId(req.params.deviceId);

			res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}
}

export const securityDevicesController = new SecurityDevicesController();