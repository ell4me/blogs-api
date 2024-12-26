import { DeleteResult } from 'mongodb';
import { injectable } from 'inversify';
import { HydratedLikesPostDocument, LikesPostModel } from './likesPost.model';

@injectable()
export class LikesPostRepository {
	async getLikePost(userId: string, postId: string): Promise<HydratedLikesPostDocument | null> {
		return LikesPostModel.findOne({
			'user.id': userId,
			postId,
		});
	}

	save(like: HydratedLikesPostDocument): Promise<HydratedLikesPostDocument> {
		return like.save();
	}

	async deleteLikePost(userId: string, postId: string): Promise<boolean> {
		const { deletedCount } = await LikesPostModel.deleteOne({
			'user.id': userId,
			postId,
		}).exec();

		return deletedCount === 1;
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
