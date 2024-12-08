import { SecurityDevicesModel, SecurityDevicesViewDto } from './securityDevices.dto';
import { securityDevicesCollection } from '../../helpers/runDb';

export class SecurityDevicesQueryRepository {
	async getActiveDeviceSessions(userId: string): Promise<SecurityDevicesViewDto[]> {
		const sessions = await securityDevicesCollection.find({
			userId,
			expiration: { $gt: new Date().getTime() },
		}).toArray();

		return sessions.map(({ deviceId, iat, deviceName, ip }) => ({
			deviceId,
			lastActiveDate: new Date(iat).toISOString(),
			title: deviceName,
			ip,
		}));
	}


	async getDeviceSession(deviceId: string): Promise<SecurityDevicesModel | null> {
		return securityDevicesCollection.findOne({ deviceId });
	}
}

const securityDevicesQueryRepository = new SecurityDevicesQueryRepository();

export { securityDevicesQueryRepository };
