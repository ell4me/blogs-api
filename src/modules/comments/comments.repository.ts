import { DeleteResult, ObjectId } from 'mongodb';
import { CommentUpdateDto } from './comments.dto';
import { CommentCreate } from './comments.types';
import { CommentsModel } from './comments.model';

export class CommentsRepository {
	async createComment(comment: CommentCreate): Promise<ObjectId> {
		const { _id } = await CommentsModel.create(comment);

		return _id;
	}

	async updateCommentById(id: string, updatedComment: CommentUpdateDto): Promise<boolean> {
		const result = await CommentsModel.findOneAndUpdate({ id }, updatedComment);

		return !!result;
	}

	async deleteCommentById(id: string): Promise<boolean> {
		const result = await CommentsModel.deleteOne({ id });

		return !!result;
	}

	deleteAllComments(): Promise<DeleteResult> {
		return CommentsModel.deleteMany().exec();
	}
}

const commentsRepository = new CommentsRepository();

export { commentsRepository };
