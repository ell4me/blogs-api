import { inject, injectable } from 'inversify';
import { LikesPostRepository } from './likesPost.repository';
import { LikesPostUpdateDto } from './likesPost.dto';
import { ValidationErrorViewDto } from '../../types';
import { STATUSES_LIKE, VALIDATION_MESSAGES } from '../../constants';
import { LikesPostModel } from './likesPost.model';

@injectable()
export class LikesPostService {
	constructor(
		@inject(LikesPostRepository) private readonly likesPostRepository: LikesPostRepository,
	) {}

	async updateLikeStatus(
		postId: string,
		user: { login: string; id: string },
		{ likeStatus }: LikesPostUpdateDto,
	): Promise<ValidationErrorViewDto | { result: boolean }> {
		if (!STATUSES_LIKE.includes(likeStatus)) {
			return {
				errorsMessages: [
					{
						message: VALIDATION_MESSAGES.LIKE_STATUS,
						field: 'likeStatus',
					},
				],
			};
		}

		let like = await this.likesPostRepository.getLikePost(user.id, postId);

		if (like) {
			like.updateStatus(likeStatus);
			await this.likesPostRepository.save(like);

			return { result: true };
		}

		like = new LikesPostModel({ user, postId, status: likeStatus });
		await this.likesPostRepository.save(like);

		return { result: true };
	}

	deleteLikesPostByUserId(userId: string): Promise<boolean> {
		return this.likesPostRepository.deleteLikesPostByUserId(userId);
	}

	deleteLikesPostByPostId(postId: string): Promise<boolean> {
		return this.likesPostRepository.deleteLikesPostByPostId(postId);
	}
}
