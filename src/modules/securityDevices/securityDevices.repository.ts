import { DeleteResult, ObjectId } from 'mongodb';

import { SecurityDevicesDocument, SecurityDevicesModel } from './securityDevices.model';
import { UpdateDeviceSession } from './securityDevices.types';
import { Model } from 'mongoose';

export class SecurityDevicesRepository {
	constructor(private readonly SecurityDevicesModel: Model<SecurityDevicesDocument>) {}

	async createDeviceSession(session: SecurityDevicesDocument): Promise<ObjectId> {
		const { _id } = await this.SecurityDevicesModel.create(session);

		return _id;
	}

	async updateCurrentDeviceSession(
		deviceId: string,
		updatedSession: UpdateDeviceSession,
	): Promise<boolean> {
		const result = await this.SecurityDevicesModel.findOneAndUpdate(
			{ deviceId },
			updatedSession,
		);

		return !!result;
	}

	async deleteAllDeviceSessionsExceptCurrent(
		userId: string,
		deviceId: string,
	): Promise<DeleteResult> {
		return this.SecurityDevicesModel.deleteMany({ userId })
			.where('deviceId')
			.nin([deviceId])
			.exec();
	}

	async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
		const result = await this.SecurityDevicesModel.findOneAndDelete({ deviceId }).exec();

		return !!result;
	}

	deleteAllSessions(): Promise<DeleteResult> {
		return this.SecurityDevicesModel.deleteMany().exec();
	}
}

const securityDevicesRepository = new SecurityDevicesRepository(SecurityDevicesModel);

export { securityDevicesRepository };
