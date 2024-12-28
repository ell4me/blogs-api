import { Schema, model } from 'mongoose';
import { MODELS_NAMES } from '../../constants';

export interface SecurityDevices {
	iat: number;
	expiration: number;
	deviceId: string;
	deviceName: string;
	ip: string;
	userId: string;
}

const securityDevicesSchema = new Schema<SecurityDevices>({
	iat: { type: Number, required: true },
	deviceName: { type: String, required: true },
	ip: { type: String, required: true },
	deviceId: { type: String, required: true },
	expiration: { type: Number, required: true },
	userId: { type: String, required: true },
});

export const SecurityDevicesModel = model(MODELS_NAMES.SECURITY_DEVICES, securityDevicesSchema);
