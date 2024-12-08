import { rateLimitRepository, RateLimitRepository } from './rateLimit.repository';
import { LimitData, RateLimitModel } from './rateLimit.model';
import { subSeconds } from 'date-fns/subSeconds';

class RateLimitService {
	private rateLimitRepository: RateLimitRepository;

	constructor(rateLimitRepository: RateLimitRepository) {
		this.rateLimitRepository = rateLimitRepository;
	}

	async checkRateLimit(
		rateLimit: RateLimitModel,
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