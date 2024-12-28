import { HydratedDocument, Model, model, Schema } from 'mongoose';
import { MODELS_NAMES, STATUSES_LIKE } from '../../constants';
import { StatusLike } from '../../types';

export interface LikesPost {
	user: {
		id: string;
		login: string;
	};
	postId: string;
	status: StatusLike;
	createdAt: Date;
}

interface LikesPostDocumentMethods {
	updateStatus: (status: StatusLike) => void;
}

type LikesPostModel = Model<LikesPost, {}, LikesPostDocumentMethods>;

export interface LikesPostDocument
	extends HydratedDocument<LikesPost, LikesPostDocumentMethods> {}

const likesPostSchema = new Schema<LikesPost, LikesPostModel, LikesPostDocumentMethods>(
	{
		user: {
			id: { type: String, required: true },
			login: { type: String, required: true },
		},
		postId: { type: String, required: true },
		status: { type: String, enum: STATUSES_LIKE, required: true },
	},
	{ timestamps: true },
);

likesPostSchema.method<LikesPostDocument>(
	'updateStatus',
	function updateStatus(status: StatusLike) {
		if (status === 'None') {
			this.deleteOne();
		}

		if (this.status === status) {
			return;
		}

		this.status = status;
	},
);

export const LikesPostModel = model(MODELS_NAMES.LIKES_POSTS, likesPostSchema);
