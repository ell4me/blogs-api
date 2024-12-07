export interface LimitData  {
	limit: number;
	ttlInSeconds: number;
}

export interface RateLimitModel {
	ip: string;
	url: string;
	date: number;
}
