export interface BlogViewDto {
	id: string;
	name: string;
	description: string;
	websiteUrl: string;
	createdAt: string;
	isMembership: boolean;
}

export interface BlogCreateDto {
	name: string;
	description: string;
	websiteUrl: string;
}

export interface BlogUpdateDto {
	name: string;
	description: string;
	websiteUrl: string;
}
