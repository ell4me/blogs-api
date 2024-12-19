import { STATUSES_LIKE } from './comments.constants';

export interface CommentatorInfo {
	userId: string;
	userLogin: string;
}

export interface LikesInfo {
	likesCount: number;
	dislikesCount: number;
	myStatus: StatusLike;
}

export interface LikesInfoDocument {
	likes: string[];
	dislikes: string[];
}

export type StatusLike = (typeof STATUSES_LIKE)[number];

export interface CommentCreate {
	id: string;
	postId: string;
	content: string;
	commentatorInfo: CommentatorInfo;
}
