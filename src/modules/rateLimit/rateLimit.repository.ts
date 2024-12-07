import { RateLimitModel } from './rateLimit.model';
import { rateLimitCollection } from '../../helpers/runDb';
import { DeleteResult, ObjectId } from 'mongodb';

export class RateLimitRepository {
	public getRateLimitsCount({ ip, date, url }: RateLimitModel): Promise<number> {
		return rateLimitCollection.countDocuments({ ip, url, date: { $gte: date } });
	}

	public async updateRateLimit(rateLimit: RateLimitModel): Promise<ObjectId> {
		const { insertedId } = await rateLimitCollection.insertOne(rateLimit);

		return insertedId;
	}

	public async deleteOldRecordsByRateLimit({
		ip,
		url,
		date,
	}: RateLimitModel): Promise<DeleteResult> {
		return rateLimitCollection.deleteMany({ ip, url, date: { $lt: date } });
	}

	public async deleteAllRateLimits(): Promise<DeleteResult> {
		return rateLimitCollection.deleteMany({});
	}
}

const rateLimitRepository = new RateLimitRepository();

export { rateLimitRepository };
