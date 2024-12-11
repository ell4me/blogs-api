import { SecurityDevicesViewDto } from './securityDevices.dto';
import { SecurityDevicesDocument, SecurityDevicesModel } from './securityDevices.model';

export class SecurityDevicesQueryRepository {
	async getActiveDeviceSessions(userId: string): Promise<SecurityDevicesViewDto[]> {
		const sessions = await SecurityDevicesModel.find({ userId })
			.where('expiration')
			.gt(new Date().getTime());

		return sessions.map(({ deviceId, iat, deviceName, ip }) => ({
			deviceId,
			lastActiveDate: new Date(iat).toISOString(),
			title: deviceName,
			ip,
		}));
	}

	async getDeviceSession(deviceId: string): Promise<SecurityDevicesDocument | null> {
		return SecurityDevicesModel.findOne({ deviceId }).exec();
	}
}

const securityDevicesQueryRepository = new SecurityDevicesQueryRepository();

export { securityDevicesQueryRepository };
