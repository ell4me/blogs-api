import { DeleteResult } from 'mongodb';
import { injectable } from 'inversify';
import { LikesPostDocument, LikesPostModel } from './likesPost.model';

@injectable()
export class LikesPostRepository {
	async getLikePost(userId: string, postId: string): Promise<LikesPostDocument | null> {
		return LikesPostModel.findOne({
			'user.id': userId,
			postId,
		});
	}

	save(like: LikesPostDocument): Promise<LikesPostDocument> {
		return like.save();
	}

	async deleteLikesPostByUserId(userId: string): Promise<boolean> {
		const { deletedCount } = await LikesPostModel.deleteMany({ 'user.id': userId }).exec();

		return !!deletedCount;
	}

	async deleteLikesPostByPostId(postId: string): Promise<boolean> {
		const { deletedCount } = await LikesPostModel.deleteMany({ postId }).exec();

		return !!deletedCount;
	}

	deleteAllLikesPost(): Promise<DeleteResult> {
		return LikesPostModel.deleteMany();
	}
}
