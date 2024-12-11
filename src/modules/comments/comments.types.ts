export interface CommentatorInfo {
	userId: string;
	userLogin: string;
}

export interface CommentCreate {
	id: string;
	postId: string;
	content: string;
	commentatorInfo: CommentatorInfo;
}
