import { CommentatorInfo, LikesInfo, StatusLike } from './comments.types';

export interface CommentViewDto {
	id: string;
	content: string;
	commentatorInfo: CommentatorInfo;
	createdAt: Date;
	likesInfo: LikesInfo;
}

export interface CommentCreateDto {
	content: string;
}

export interface CommentUpdateDto {
	content: string;
}

export interface CommentLikeDto {
	likeStatus: StatusLike;
}
