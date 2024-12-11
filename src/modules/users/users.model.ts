import { Schema, model } from 'mongoose';
import { MODELS_NAMES } from '../../constants';
import { EmailConfirmation } from './users.types';

export interface UserDocument {
	id: string;
	login: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	emailConfirmation: EmailConfirmation;
}

const usersSchema = new Schema<UserDocument>(
	{
		id: { type: String, required: true },
		login: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		emailConfirmation: {
			isConfirmed: { type: Boolean, default: false },
			expiration: { type: Number, required: true },
			code: { type: String, default: '' },
		},
	},
	{ timestamps: true },
);

export const UsersModel = model(MODELS_NAMES.USERS, usersSchema);
