import { Request } from 'express';

type ReqQuery<T> = Request<{}, {}, {}, T>;
type ReqParams<T> = Request<T>;
type ReqBody<T> = Request<{}, {}, T>;

interface ErrorMessage {
	message: string;
	field: string;
}

interface ValidationErrorViewDto {
	errorsMessages: ErrorMessage[];
}

export { ReqQuery, ReqParams, ReqBody, ValidationErrorViewDto };
