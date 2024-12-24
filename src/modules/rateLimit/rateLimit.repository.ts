import { RateLimitDocument, RateLimitModel } from './rateLimit.model';
import { DeleteResult, ObjectId } from 'mongodb';
import { Model } from 'mongoose';

export class RateLimitRepository {
	constructor(private readonly RateLimitModel: Model<RateLimitDocument>) {}

	getRateLimitsCount({ ip, date, url }: RateLimitDocument): Promise<number> {
		return this.RateLimitModel.countDocuments({ ip, url }).where('date').gte(date).exec();
	}

	async updateRateLimit(rateLimit: RateLimitDocument): Promise<ObjectId> {
		const { _id } = await this.RateLimitModel.create(rateLimit);

		return _id;
	}

	async deleteOldRecordsByRateLimit({ ip, url, date }: RateLimitDocument): Promise<DeleteResult> {
		return this.RateLimitModel.deleteMany({ ip, url }).where('date').lt(date).exec();
	}

	async deleteAllRateLimits(): Promise<DeleteResult> {
		return this.RateLimitModel.deleteMany().exec();
	}
}

const rateLimitRepository = new RateLimitRepository(RateLimitModel);

export { rateLimitRepository };
