import { Request } from 'express';
import { SortDirection } from 'mongodb';

export type ReqQuery<T> = Request<{}, {}, {}, T>;
export type ReqParams<T> = Request<T>;
export type ReqBody<T> = Request<{}, {}, T>;
export type ReqQueryWithParams<T, K> = Request<T, {}, {}, K>;
export type ReqBodyWithParams<T, K> = Request<T, {}, K>;

export interface ErrorMessage {
	message: string;
	field: string;
}

export interface ValidationErrorViewDto {
	errorsMessages: ErrorMessage[];
}

export interface FilterQueries extends Partial<Record<'searchNameTerm' | 'sortBy' | 'sortDirection' | 'pageNumber' | 'pageSize', string>> {
}

export interface FilteredQueries {
	searchNameTerm: string | null;
	sortBy: string;
	sortDirection: SortDirection;
	pageNumber: number;
	pageSize: number;
}

export interface ItemsPaginationViewDto<T = {}> {
	pagesCount: number;
	page: number;
	pageSize: number;
	totalCount: number;
	items: T[];
}
