import { RateLimitDocument, RateLimitModel } from './rateLimit.model';
import { DeleteResult, ObjectId } from 'mongodb';
import { Model } from 'mongoose';

export class RateLimitRepository {
	constructor(private readonly RateLimitModel: Model<RateLimitDocument>) {}

	getRateLimitsCount({ ip, date, url }: RateLimitDocument): Promise<number> {
		return this.RateLimitModel.countDocuments({ ip, url }).where('date').gte(date);
	}

	async updateRateLimit(rateLimit: RateLimitDocument): Promise<ObjectId> {
		const { _id } = await this.RateLimitModel.create(rateLimit);

		return _id;
	}

	async deleteOldRecordsByRateLimit({ ip, url, date }: RateLimitDocument): Promise<DeleteResult> {
		return this.RateLimitModel.deleteMany({ ip, url }).where('date').lt(date);
	}

	async deleteAllRateLimits(): Promise<DeleteResult> {
		return this.RateLimitModel.deleteMany();
	}
}

const rateLimitRepository = new RateLimitRepository(RateLimitModel);

export { rateLimitRepository };
