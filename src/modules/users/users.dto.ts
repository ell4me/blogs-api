export interface UserViewDto {
	id: string;
	login: string;
	email: string;
	createdAt: Date;
}

export interface UserCreateDto {
	login: string;
	email: string;
	password: string;
}
