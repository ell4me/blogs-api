import { injectable } from 'inversify';
import { LikesPostDocument, LikesPost, LikesPostModel } from './likesPost.model';
import { ExtendedLikesInfo } from './likesPost.types';
import { StatusLike } from '../../types';

@injectable()
export class LikesPostQueryRepository {
	async getLikesByPostId(postId: string, userId?: string): Promise<ExtendedLikesInfo> {
		const LIKE: StatusLike = 'Like';
		const DISLIKE: StatusLike = 'Dislike';

		const likes: LikesPost[] = await LikesPostModel.find({ postId })
			.where('status', LIKE)
			.limit(3)
			.sort({ createdAt: -1 })
			.lean();

		const likesCount = await LikesPostModel.find({ postId })
			.where('status', LIKE)
			.countDocuments()
			.exec();

		const dislikesCount = await LikesPostModel.find({ postId })
			.where('status', DISLIKE)
			.countDocuments()
			.exec();

		let likeByUserId: LikesPostDocument | null = null;

		if (userId) {
			likeByUserId = await LikesPostModel.findOne({
				'user.id': userId,
				postId,
			});
		}

		return {
			likesCount,
			dislikesCount,
			myStatus: likeByUserId ? likeByUserId.status : 'None',
			newestLikes: likes.length
				? likes.map(({ user, createdAt }) => ({
						userId: user.id,
						login: user.login,
						addedAt: createdAt,
					}))
				: [],
		};
	}

	async getLikesByPostIds(
		postIds: string[],
		userId?: string,
	): Promise<Record<string, ExtendedLikesInfo>> {
		const likes: LikesPost[] = await LikesPostModel.find()
			.where('postId')
			.in(postIds)
			.sort({ createdAt: -1 })
			.lean();

		let extendedLikesInfo: Record<string, ExtendedLikesInfo> = {};

		postIds.forEach(postId => {
			extendedLikesInfo[postId] = {
				likesCount: 0,
				dislikesCount: 0,
				newestLikes: [],
				myStatus: 'None',
			};
		});

		likes.forEach(({ postId, createdAt, status, user }) => {
			const currentLikesPost = extendedLikesInfo[postId];
			if (status === 'Like') {
				currentLikesPost.likesCount += 1;

				if (currentLikesPost.newestLikes.length < 3) {
					currentLikesPost.newestLikes.push({
						addedAt: createdAt,
						userId: user.id,
						login: user.login,
					});
				}
			}

			if (status === 'Dislike') {
				currentLikesPost.dislikesCount += 1;
			}

			if (userId && currentLikesPost.myStatus === 'None' && userId === user.id) {
				currentLikesPost.myStatus = status;
			}
		});

		return extendedLikesInfo;
	}
}
