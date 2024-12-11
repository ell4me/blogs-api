import { DeleteResult, ObjectId } from 'mongodb';

import { SecurityDevicesDocument, SecurityDevicesModel } from './securityDevices.model';
import { UpdateDeviceSession } from './securityDevices.types';

export class SecurityDevicesRepository {
	async createDeviceSession(session: SecurityDevicesDocument): Promise<ObjectId> {
		const { _id } = await SecurityDevicesModel.create(session);

		return _id;
	}

	async updateCurrentDeviceSession(
		deviceId: string,
		updatedSession: UpdateDeviceSession,
	): Promise<boolean> {
		const result = await SecurityDevicesModel.findOneAndUpdate({ deviceId }, updatedSession);

		return !!result;
	}

	async deleteAllDeviceSessionsExceptCurrent(
		userId: string,
		deviceId: string,
	): Promise<DeleteResult> {
		return SecurityDevicesModel.deleteMany({ userId }).where('deviceId').nin([deviceId]).exec();
	}

	async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
		const result = await SecurityDevicesModel.findOneAndDelete({ deviceId }).exec();

		return !!result;
	}

	deleteAllSessions(): Promise<DeleteResult> {
		return SecurityDevicesModel.deleteMany().exec();
	}
}

const securityDevicesRepository = new SecurityDevicesRepository();

export { securityDevicesRepository };
