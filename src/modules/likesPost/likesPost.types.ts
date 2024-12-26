import { StatusLike } from '../../types';

export interface ExtendedLikesInfo {
	likesCount: number;
	dislikesCount: number;
	myStatus: StatusLike;
	newestLikes: LikesInfo[];
}

interface LikesInfo {
	addedAt: Date;
	userId: string;
	login: string;
}
