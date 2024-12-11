import { CommentatorInfo } from './comments.types';

export interface CommentViewDto {
	id: string;
	content: string;
	commentatorInfo: CommentatorInfo;
	createdAt: Date;
}

export interface CommentCreateDto {
	content: string;
}

export interface CommentUpdateDto {
	content: string;
}
