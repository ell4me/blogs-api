import { Schema, model } from 'mongoose';
import { MODELS_NAMES } from '../../constants';
import { EmailConfirmation, PasswordRecovery } from './users.types';

export interface User {
	id: string;
	login: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	emailConfirmation: EmailConfirmation;
	passwordRecovery?: PasswordRecovery;
}

const usersSchema = new Schema<User>(
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
		passwordRecovery: {
			code: String,
			expiration: Number,
		},
	},
	{ timestamps: true },
);

export const UsersModel = model(MODELS_NAMES.USERS, usersSchema);
