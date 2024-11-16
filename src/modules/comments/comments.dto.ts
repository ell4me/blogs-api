export interface CommentatorInfo {
	userId: string;
	userLogin: string;
}

export interface CommentViewDto {
	id: string;
	content: string;
	commentatorInfo: CommentatorInfo;
	createdAt: string;
}

export interface CommentModel {
	id: string;
	postId: string;
	content: string;
	commentatorInfo: CommentatorInfo;
	createdAt: string;
}

export interface CommentCreateDto {
	content: string;
}

export interface CommentUpdateDto {
	content: string;
}
