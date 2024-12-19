import { LikesInfo, LikesInfoDocument, StatusLike } from '../modules/comments/comments.types';

export const getLikesInfoByUser = (likesInfo: LikesInfoDocument, userId?: string): LikesInfo => {
	let myStatus: StatusLike = 'None';

	if (likesInfo.likes.includes(String(userId))) {
		myStatus = 'Like';
	}

	if (likesInfo.dislikes.includes(String(userId))) {
		myStatus = 'Dislike';
	}

	return {
		likesCount: likesInfo.likes.length,
		dislikesCount: likesInfo.dislikes.length,
		myStatus,
	};
};
