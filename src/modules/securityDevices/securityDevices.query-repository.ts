import { SecurityDevicesViewDto } from './securityDevices.dto';
import { securityDevicesCollection } from '../../helpers/runDb';

export class SecurityDevicesQueryRepository {
	async getActiveDeviceSessions(userId: string): Promise<SecurityDevicesViewDto[]> {
		const sessions = await securityDevicesCollection.find({
			userId,
			expiration: { $gt: new Date().getTime() },
		}).toArray();

		return sessions.map(({ deviceId, iat, deviceName, ip }) => ({
			deviceId,
			lastActiveDate: iat,
			title: deviceName,
			ip,
		}));
	}

}

const securityDevicesQueryRepository = new SecurityDevicesQueryRepository();

export { securityDevicesQueryRepository };
