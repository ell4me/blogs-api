export interface EmailConfirmation {
	code: string;
	expiration: number;
	isConfirmed: boolean;
}

export interface PasswordRecovery {
	code: string;
	expiration: number;
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}

export interface UserCreate {
	id: string;
	login: string;
	email: string;
	password: string;
	emailConfirmation: EmailConfirmation;
}
