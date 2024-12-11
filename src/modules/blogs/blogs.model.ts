import { Schema, model } from 'mongoose';
import { MODELS_NAMES } from '../../constants';

export interface BlogDocument {
	id: string;
	name: string;
	description: string;
	websiteUrl: string;
	createdAt: Date;
	updatedAt: Date;
	isMembership: boolean;
}

const blogsSchema = new Schema<BlogDocument>(
	{
		id: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		websiteUrl: { type: String, required: true },
		isMembership: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const BlogsModel = model(MODELS_NAMES.BLOGS, blogsSchema);
