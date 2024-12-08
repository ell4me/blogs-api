import { SecurityDevicesRepository, securityDevicesRepository } from './securityDevices.repository';
import {
	SecurityDevicesCreate,
	SecurityDevicesModel,
	SecurityDevicesUpdate,
	UpdateDeviceSession,
} from './securityDevices.dto';
import { v4 as uuidv4 } from 'uuid';
import { getTokens } from '../users/helpers/getTokens';
import { Tokens } from '../users/users.dto';
import { EXPIRATION_TOKEN } from '../../constants';
import { addSeconds } from 'date-fns/addSeconds';

export class SecurityDevicesService {
	private securityDevicesRepository: SecurityDevicesRepository;

	constructor(securityDevicesRepository: SecurityDevicesRepository) {
		this.securityDevicesRepository = securityDevicesRepository;
	}

	async createDeviceSession({ userId, deviceName, ip }: SecurityDevicesCreate): Promise<Tokens> {
		const deviceId = uuidv4();
		const currentDate = new Date();
		const expiration = addSeconds(currentDate, EXPIRATION_TOKEN.REFRESH).getTime();

		const deviceSession: SecurityDevicesModel = {
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

	async updateCurrentDeviceSession(deviceId: string, {
		deviceName,
		userId,
		ip,
	}: SecurityDevicesUpdate): Promise<Tokens | void> {
		const currentDate = new Date();
		const expiration = addSeconds(currentDate, EXPIRATION_TOKEN.REFRESH).getTime();

		const updatedSession: UpdateDeviceSession = {
			iat: currentDate.getTime(),
			expiration,
			deviceName: deviceName || 'Unknown',
			ip,
		};

		const isUpdated = await this.securityDevicesRepository.updateCurrentDeviceSession(deviceId, updatedSession);

		if(!isUpdated) {
			return;
		}

		return getTokens(userId, deviceId, currentDate.getTime());
	}

	async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
		return this.securityDevicesRepository.deleteSessionByDeviceId(deviceId)
	}

	async deleteAllDeviceSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
		await this.securityDevicesRepository.deleteAllDeviceSessionsExceptCurrent(userId, deviceId);
	}
}

export const securityDevicesService = new SecurityDevicesService(securityDevicesRepository);
