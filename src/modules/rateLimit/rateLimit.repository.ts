import { RateLimit, RateLimitModel } from './rateLimit.model';
import { DeleteResult, ObjectId } from 'mongodb';
import { Model } from 'mongoose';

export class RateLimitRepository {
	constructor(private readonly RateLimitModel: Model<RateLimit>) {}

	getRateLimitsCount({ ip, date, url }: RateLimit): Promise<number> {
		return this.RateLimitModel.countDocuments({ ip, url }).where('date').gte(date);
	}

	async updateRateLimit(rateLimit: RateLimit): Promise<ObjectId> {
		const { _id } = await this.RateLimitModel.create(rateLimit);

		return _id;
	}

	async deleteOldRecordsByRateLimit({ ip, url, date }: RateLimit): Promise<DeleteResult> {
		return this.RateLimitModel.deleteMany({ ip, url }).where('date').lt(date);
	}

	async deleteAllRateLimits(): Promise<DeleteResult> {
		return this.RateLimitModel.deleteMany();
	}
}

const rateLimitRepository = new RateLimitRepository(RateLimitModel);

export { rateLimitRepository };
