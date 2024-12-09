export interface AuthLoginDto {
	loginOrEmail: string;
	password: string;
}

export interface CurrentUserViewDto {
	email: string;
	login: string;
	userId: string;
}

export interface RegistrationConfirmationDto {
	code: string;
}

export interface RegistrationEmailResendingDto {
	email: string;
}
