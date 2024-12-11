export interface PostViewDto {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	createdAt: Date;
}

export interface PostCreateByBlogIdDto {
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
}

export interface PostCreateByBlogId {
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
}

export interface PostCreateDto {
	title: string;
	shortDescription: string;
	content: string;
}

export interface PostUpdateDto {
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
}
