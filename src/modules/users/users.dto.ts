export interface UserModel {
	id: string;
	login: string;
	email: string;
	password: string;
	createdAt: string;
	emailConfirmation: EmailConfirmation;
}

export interface UserViewDto {
	id: string;
	login: string;
	email: string;
	createdAt: string;
}

export interface UserCreateDto {
	login: string;
	email: string;
	password: string;
}

interface EmailConfirmation {
	code: string;
	expiration: number;
	isConfirmed: boolean;
}
