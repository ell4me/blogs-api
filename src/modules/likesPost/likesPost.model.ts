import { HydratedDocument, Model, model, Schema } from 'mongoose';
import { MODELS_NAMES, STATUSES_LIKE } from '../../constants';
import { StatusLike } from '../../types';

export interface LikesPostDocument {
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

type LikesPostModel = Model<LikesPostDocument, {}, LikesPostDocumentMethods>;

export interface HydratedLikesPostDocument
	extends HydratedDocument<LikesPostDocument, LikesPostDocumentMethods> {}

const likesPostSchema = new Schema<LikesPostDocument, LikesPostModel, LikesPostDocumentMethods>(
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

likesPostSchema.method<HydratedLikesPostDocument>(
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
