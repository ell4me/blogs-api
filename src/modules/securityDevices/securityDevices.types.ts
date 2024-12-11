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
