import { Schema, model } from 'mongoose';
import { CommentatorInfo, LikesInfoDocument } from './comments.types';
import { MODELS_NAMES } from '../../constants';

export interface Comment {
	id: string;
	postId: string;
	content: string;
	commentatorInfo: CommentatorInfo;
	createdAt: Date;
	updatedAt: Date;
	likesInfo: LikesInfoDocument;
}

const commentsSchema = new Schema<Comment>(
	{
		id: { type: String, required: true },
		postId: { type: String, required: true },
		content: { type: String, required: true },
		commentatorInfo: {
			userId: { type: String, required: true },
			userLogin: { type: String, required: true },
		},
		likesInfo: {
			likes: Array,
			dislikes: Array,
		},
	},
	{ timestamps: true },
);

export const CommentsModel = model(MODELS_NAMES.COMMENTS, commentsSchema);
