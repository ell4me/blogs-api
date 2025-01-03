import { DeleteResult, ObjectId } from 'mongodb';

import { SecurityDevices, SecurityDevicesModel } from './securityDevices.model';
import { UpdateDeviceSession } from './securityDevices.types';
import { injectable } from 'inversify';

@injectable()
export class SecurityDevicesRepository {
	async createDeviceSession(session: SecurityDevices): Promise<ObjectId> {
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
		return SecurityDevicesModel.deleteMany({ userId }).where('deviceId').nin([deviceId]);
	}

	async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
		const result = await SecurityDevicesModel.findOneAndDelete({ deviceId });

		return !!result;
	}

	deleteAllSessions(): Promise<DeleteResult> {
		return SecurityDevicesModel.deleteMany();
	}
}
