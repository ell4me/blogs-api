import { Schema, model } from 'mongoose';
import { MODELS_NAMES } from '../../constants';

export interface PostDocument {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	createdAt: Date;
	updatedAt: Date;
}

const postsSchema = new Schema<PostDocument>(
	{
		id: { type: String, required: true },
		title: { type: String, required: true },
		shortDescription: { type: String, required: true },
		content: { type: String, required: true },
		blogId: { type: String, required: true },
		blogName: { type: String, required: true },
	},
	{ timestamps: true },
);

export const PostsModel = model(MODELS_NAMES.POSTS, postsSchema);
