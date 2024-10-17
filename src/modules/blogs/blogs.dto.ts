export interface BlogViewDto {
	id: string;
	name: string;
	description: string;
	websiteUrl: string;
}

export interface BlogCreateDto extends Omit<BlogViewDto, 'id'>{}
export interface BlogUpdateDto extends Omit<BlogViewDto, 'id'>{}
