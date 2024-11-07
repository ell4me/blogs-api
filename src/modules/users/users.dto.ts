export interface UserModel {
	id: string;
	login: string;
	email: string;
	password: string;
	createdAt: string;
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
