import { CommentatorInfo, LikesInfo } from './comments.types';
import { StatusLike } from '../../types';

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
