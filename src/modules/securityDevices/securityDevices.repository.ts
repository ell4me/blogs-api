import { SecurityDevicesModel, UpdateDeviceSession } from './securityDevices.dto';
import { securityDevicesCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';

export class SecurityDevicesRepository {
	async createDeviceSession(session: SecurityDevicesModel): Promise<ObjectId> {
		const { insertedId } = await securityDevicesCollection.insertOne(session);

		return insertedId;
	}

	async updateCurrentDeviceSession(
		deviceId: string,
		updatedSession: UpdateDeviceSession,
	): Promise<boolean> {
		const { modifiedCount } = await securityDevicesCollection.updateOne(
			{ deviceId },
			{ $set: updatedSession },
		);

		return modifiedCount === 1;
	}

	async deleteAllDeviceSessionsExceptCurrent(
		userId: string,
		deviceId: string,
	): Promise<DeleteResult> {
		return securityDevicesCollection.deleteMany({ userId, deviceId: { $nin: [deviceId] } });
	}

	async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
		const { deletedCount } = await securityDevicesCollection.deleteOne({ deviceId });

		return deletedCount === 1;
	}

	deleteAllSessions(): Promise<DeleteResult> {
		return securityDevicesCollection.deleteMany({});
	}
}

const securityDevicesRepository = new SecurityDevicesRepository();

export { securityDevicesRepository };
