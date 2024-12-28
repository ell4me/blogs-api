import { rateLimitRepository, RateLimitRepository } from './rateLimit.repository';
import { RateLimit } from './rateLimit.model';
import { subSeconds } from 'date-fns/subSeconds';
import { LimitData } from './rateLimit.types';

class RateLimitService {
	constructor(private readonly rateLimitRepository: RateLimitRepository) {}

	async checkRateLimit(
		rateLimit: RateLimit,
		{ limit, ttlInSeconds }: LimitData,
	): Promise<boolean> {
		const limitDate = subSeconds(rateLimit.date, ttlInSeconds).getTime();
		const rateLimitsCount = await this.rateLimitRepository.getRateLimitsCount({
			url: rateLimit.url,
			ip: rateLimit.ip,
			date: limitDate,
		});

		if (rateLimitsCount === limit) {
			return false;
		}

		await this.rateLimitRepository.updateRateLimit(rateLimit);
		await this.rateLimitRepository.deleteOldRecordsByRateLimit({
			url: rateLimit.url,
			ip: rateLimit.ip,
			date: limitDate,
		});

		return true;
	}
}

export const rateLimitService = new RateLimitService(rateLimitRepository);
