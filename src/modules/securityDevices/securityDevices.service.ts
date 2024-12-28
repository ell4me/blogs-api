import { SecurityDevicesRepository } from './securityDevices.repository';

import { v4 as uuidv4 } from 'uuid';
import { getTokens } from '../users/helpers/getTokens';
import { EXPIRATION_TOKEN } from '../../constants';
import { addSeconds } from 'date-fns/addSeconds';
import {
	SecurityDevicesCreate,
	SecurityDevicesUpdate,
	UpdateDeviceSession,
} from './securityDevices.types';
import { SecurityDevices } from './securityDevices.model';
import { Tokens } from '../users/users.types';
import { inject, injectable } from 'inversify';

@injectable()
export class SecurityDevicesService {
	constructor(
		@inject(SecurityDevicesRepository)
		private readonly securityDevicesRepository: SecurityDevicesRepository,
	) {}

	async createDeviceSession({ userId, deviceName, ip }: SecurityDevicesCreate): Promise<Tokens> {
		const deviceId = uuidv4();
		const currentDate = new Date();
		const expiration = addSeconds(currentDate, EXPIRATION_TOKEN.REFRESH).getTime();

		const deviceSession: SecurityDevices = {
			iat: currentDate.getTime(),
			expiration,
			deviceId,
			userId,
			deviceName,
			ip,
		};

		await this.securityDevicesRepository.createDeviceSession(deviceSession);

		return getTokens(userId, deviceId, currentDate.getTime());
	}

	async updateCurrentDeviceSession(
		deviceId: string,
		{ deviceName, userId, ip }: SecurityDevicesUpdate,
	): Promise<Tokens | void> {
		const currentDate = new Date();
		const expiration = addSeconds(currentDate, EXPIRATION_TOKEN.REFRESH).getTime();

		const updatedSession: UpdateDeviceSession = {
			iat: currentDate.getTime(),
			expiration,
			deviceName: deviceName || 'Unknown',
			ip,
		};

		const isUpdated = await this.securityDevicesRepository.updateCurrentDeviceSession(
			deviceId,
			updatedSession,
		);

		if (!isUpdated) {
			return;
		}

		return getTokens(userId, deviceId, currentDate.getTime());
	}

	async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
		return this.securityDevicesRepository.deleteSessionByDeviceId(deviceId);
	}

	async deleteAllDeviceSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
		await this.securityDevicesRepository.deleteAllDeviceSessionsExceptCurrent(userId, deviceId);
	}
}
