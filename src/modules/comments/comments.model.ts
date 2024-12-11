import { Schema, model } from 'mongoose';
import { CommentatorInfo } from './comments.types';
import { MODELS_NAMES } from '../../constants';

export interface CommentDocument {
	id: string;
	postId: string;
	content: string;
	commentatorInfo: CommentatorInfo;
	createdAt: Date;
	updatedAt: Date;
}

const commentsSchema = new Schema<CommentDocument>(
	{
		id: { type: String, required: true },
		postId: { type: String, required: true },
		content: { type: String, required: true },
		commentatorInfo: {
			userId: { type: String, required: true },
			userLogin: { type: String, required: true },
		},
	},
	{ timestamps: true },
);

export const CommentsModel = model(MODELS_NAMES.COMMENTS, commentsSchema);
