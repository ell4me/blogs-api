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

export interface EmailConfirmation {
	code: string;
	expiration: number;
	isConfirmed: boolean;
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}
