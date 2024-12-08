export interface SecurityDevicesViewDto {
	ip: string;
	title: string;
	lastActiveDate: string;
	deviceId: string;
}

export interface SecurityDevicesModel {
	iat: string;
	expiration: number;
	deviceId: string;
	deviceName: string;
	ip: string;
	userId: string;
}

export interface UpdateDeviceSession {
	iat: string;
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