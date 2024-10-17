export interface PostViewDto {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
}

export interface PostModel extends Omit<PostViewDto, 'blogName'> {}

export interface PostCreateDto extends Omit<PostViewDto, 'id' | 'blogName'> {}

export interface PostUpdateDto extends Omit<PostViewDto, 'id' | 'blogName'> {}
