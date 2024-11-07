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

export interface FilterBlogQueries extends Partial<Record<'searchNameTerm' | 'sortBy' | 'sortDirection' | 'pageNumber' | 'pageSize', string>> {
}

export interface FilterUserQueries extends Partial<Record<'searchLoginTerm' | 'searchEmailTerm' | 'sortBy' | 'sortDirection' | 'pageNumber' | 'pageSize', string>> {
}

interface PaginationQueries {
	sortBy: string;
	sortDirection: SortDirection;
	pageNumber: number;
	pageSize: number;
}

export interface FilteredBlogQueries extends PaginationQueries {
	searchNameTerm: string | null;
}

export interface FilteredUserQueries extends PaginationQueries {
	searchLoginTerm: string | null;
	searchEmailTerm: string | null;
}

export interface ItemsPaginationViewDto<T = {}> {
	pagesCount: number;
	page: number;
	pageSize: number;
	totalCount: number;
	items: T[];
}
