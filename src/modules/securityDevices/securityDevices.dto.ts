export interface SecurityDevicesViewDto {
	ip: string;
	title: string;
	lastActiveDate: string;
	deviceId: string;
}

export interface SecurityDevicesModel {
	iat: number;
	expiration: number;
	deviceId: string;
	deviceName: string;
	ip: string;
	userId: string;
}

export interface UpdateDeviceSession {
	iat: number;
	expiration: number;
	deviceName: string;
	ip: string;
}

export interface SecurityDevicesCreate {
	userId: string;
	deviceName: string;
	ip: string;
}

export interface SecurityDevicesUpdate {
	userId: string;
	deviceName: string;
	ip: string;
}
