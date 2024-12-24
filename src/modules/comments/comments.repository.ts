import { injectable } from 'inversify';
import { DeleteResult, ObjectId } from 'mongodb';
import { CommentUpdateDto } from './comments.dto';
import { CommentCreate, StatusLike } from './comments.types';
import { CommentsModel } from './comments.model';

@injectable()
export class CommentsRepository {
	async createComment(comment: CommentCreate): Promise<ObjectId> {
		const { _id } = await CommentsModel.create(comment);

		return _id;
	}

	async updateCommentById(id: string, updatedComment: CommentUpdateDto): Promise<boolean> {
		const result = await CommentsModel.findOneAndUpdate({ id }, updatedComment);

		return !!result;
	}

	async likeCommentById(
		commentId: string,
		userId: string,
		likeStatus: StatusLike,
	): Promise<boolean> {
		const query = CommentsModel.findOne({ id: commentId });

		if (likeStatus === 'Like') {
			query.setUpdate({
				$push: { 'likesInfo.likes': userId },
				$pull: { 'likesInfo.dislikes': userId },
			});
		}

		if (likeStatus === 'Dislike') {
			query.setUpdate({
				$push: { 'likesInfo.dislikes': userId },
				$pull: { 'likesInfo.likes': userId },
			});
		}

		if (likeStatus === 'None') {
			query.setUpdate({ $pull: { 'likesInfo.dislikes': userId, 'likesInfo.likes': userId } });
		}

		const result = await query.updateOne().exec();

		return result.modifiedCount === 1;
	}

	async deleteCommentById(id: string): Promise<boolean> {
		const result = await CommentsModel.deleteOne({ id });

		return !!result;
	}

	deleteAllComments(): Promise<DeleteResult> {
		return CommentsModel.deleteMany().exec();
	}
}
