import { commentsCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';
import { CommentModel, CommentUpdateDto } from './comments.dto';

export class CommentsRepository {
	public async createComment(comment: CommentModel): Promise<ObjectId> {
		const { insertedId } = await commentsCollection.insertOne(comment);

		return insertedId;
	}

	public async updateCommentById(id: string, updatedComment: CommentUpdateDto): Promise<boolean> {
		const { modifiedCount } = await commentsCollection.updateOne({ id }, {$set: updatedComment});

		return modifiedCount === 1;
	}

	public async deleteCommentById(id: string): Promise<boolean> {
		const { deletedCount } = await commentsCollection.deleteOne({ id });

		return deletedCount === 1;
	}

	public deleteAllComments(): Promise<DeleteResult> {
		return commentsCollection.deleteMany({});
	}
}

const commentsRepository = new CommentsRepository();

export { commentsRepository };
