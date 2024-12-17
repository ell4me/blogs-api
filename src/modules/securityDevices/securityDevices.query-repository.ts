import { SecurityDevicesViewDto } from './securityDevices.dto';
import { SecurityDevicesDocument, SecurityDevicesModel } from './securityDevices.model';
import { Model } from 'mongoose';

export class SecurityDevicesQueryRepository {
	constructor(private readonly SecurityDevicesModel: Model<SecurityDevicesDocument>) {}

	async getActiveDeviceSessions(userId: string): Promise<SecurityDevicesViewDto[]> {
		const sessions = await this.SecurityDevicesModel.find({ userId })
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
		return this.SecurityDevicesModel.findOne({ deviceId }).exec();
	}
}

const securityDevicesQueryRepository = new SecurityDevicesQueryRepository(SecurityDevicesModel);

export { securityDevicesQueryRepository };
