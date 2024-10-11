import { Request } from 'express';

type ReqQuery<T> = Request<{}, {}, {}, T>;
type ReqParams<T> = Request<T>;
type ReqBody<T> = Request<{}, {}, T>;
type ReqBodyWithParams<T, K> = Request<T, {}, K>;

interface ErrorMessage {
	message: string;
	field: string;
}

interface ValidationErrorViewDto {
	errorsMessages: ErrorMessage[];
}

export { ReqQuery, ReqParams, ReqBody, ReqBodyWithParams, ValidationErrorViewDto, ErrorMessage };
