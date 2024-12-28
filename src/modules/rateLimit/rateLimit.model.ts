import { model, Schema } from 'mongoose';
import { MODELS_NAMES } from '../../constants';

export interface RateLimit {
	ip: string;
	url: string;
	date: number;
}

const rateLimitSchema = new Schema<RateLimit>({
	ip: String,
	url: String,
	date: Number,
});

export const RateLimitModel = model(MODELS_NAMES.RATE_LIMIT, rateLimitSchema);
