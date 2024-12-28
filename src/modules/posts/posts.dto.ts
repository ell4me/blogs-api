import { ExtendedLikesInfo } from '../likesPost/likesPost.types';

export interface PostViewDto {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	createdAt: Date;
	extendedLikesInfo: ExtendedLikesInfo;
}

export interface PostCreateByBlogIdDto {
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
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
