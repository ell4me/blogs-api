export interface BlogViewDto {
	id: string;
	name: string;
	description: string;
	websiteUrl: string;
	createdAt: string;
	isMembership: boolean;
}

export interface BlogCreateDto extends Pick<BlogViewDto, 'name' | 'description' | 'websiteUrl'> {}
export interface BlogUpdateDto extends Pick<BlogViewDto, 'name' | 'description' | 'websiteUrl'> {}
