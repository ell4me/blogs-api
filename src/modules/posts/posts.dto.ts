export interface PostViewDto {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	createdAt: string;
}

export interface PostCreateByBlogIdDto extends Omit<PostViewDto, 'id' | 'blogName' | 'createdAt'> {}
export interface PostCreateDto extends Omit<PostViewDto, 'id' | 'blogName' | 'createdAt' | 'blogId'> {}

export interface PostUpdateDto extends Omit<PostViewDto, 'id' | 'blogName' | 'createdAt'> {}
