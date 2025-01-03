import { SecurityDevicesViewDto } from './securityDevices.dto';
import { SecurityDevices, SecurityDevicesModel } from './securityDevices.model';
import { injectable } from 'inversify';

@injectable()
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

	async getDeviceSession(deviceId: string): Promise<SecurityDevices | null> {
		return SecurityDevicesModel.findOne({ deviceId });
	}
}
