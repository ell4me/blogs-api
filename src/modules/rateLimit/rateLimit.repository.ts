import { RateLimitModel } from './rateLimit.model';
import { rateLimitCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';

export class RateLimitRepository {
	getRateLimitsCount({ ip, date, url }: RateLimitModel): Promise<number> {
		return rateLimitCollection.countDocuments({ ip, url, date: { $gte: date } });
	}

	async updateRateLimit(rateLimit: RateLimitModel): Promise<ObjectId> {
		const { insertedId } = await rateLimitCollection.insertOne(rateLimit);

		return insertedId;
	}

	async deleteOldRecordsByRateLimit({ ip, url, date }: RateLimitModel): Promise<DeleteResult> {
		return rateLimitCollection.deleteMany({ ip, url, date: { $lt: date } });
	}

	async deleteAllRateLimits(): Promise<DeleteResult> {
		return rateLimitCollection.deleteMany({});
	}
}

const rateLimitRepository = new RateLimitRepository();

export { rateLimitRepository };
