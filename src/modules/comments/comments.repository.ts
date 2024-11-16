import { commentsCollection } from '../../helpers/runDb';
import { ObjectId } from 'mongodb';
import { CommentModel, CommentUpdateDto } from './comments.dto';

export class CommentsRepository {
	public async createComment(comment: CommentModel): Promise<ObjectId> {
		const { insertedId } = await commentsCollection.insertOne(comment);

		return insertedId;
	}

	public async updateCommentById(id: string, updatedComment: CommentUpdateDto): Promise<boolean> {
		const { modifiedCount } = await commentsCollection.updateOne({ id }, updatedComment);

		return modifiedCount === 1;
	}

	public async deleteCommentById(id: string): Promise<boolean> {
		const { deletedCount } = await commentsCollection.deleteOne({ id });

		return deletedCount === 1;
	}
}

const commentsRepository = new CommentsRepository();

export { commentsRepository };
