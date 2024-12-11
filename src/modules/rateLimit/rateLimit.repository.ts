import { RateLimitDocument, RateLimitModel } from './rateLimit.model';
import { DeleteResult, ObjectId } from 'mongodb';

export class RateLimitRepository {
	getRateLimitsCount({ ip, date, url }: RateLimitDocument): Promise<number> {
		return RateLimitModel.countDocuments({ ip, url }).where('date').gte(date).exec();
	}

	async updateRateLimit(rateLimit: RateLimitDocument): Promise<ObjectId> {
		const { _id } = await RateLimitModel.create(rateLimit);

		return _id;
	}

	async deleteOldRecordsByRateLimit({ ip, url, date }: RateLimitDocument): Promise<DeleteResult> {
		return RateLimitModel.deleteMany({ ip, url }).where('date').lt(date).exec();
	}

	async deleteAllRateLimits(): Promise<DeleteResult> {
		return RateLimitModel.deleteMany().exec();
	}
}

const rateLimitRepository = new RateLimitRepository();

export { rateLimitRepository };
