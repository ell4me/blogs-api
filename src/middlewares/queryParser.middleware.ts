import { NextFunction, Response } from 'express';
import {
	FilterBlogQueries,
	FilteredBlogQueries,
	FilteredUserQueries,
	FilterUserQueries,
	ReqQuery,
} from '../types';

export const queryBlogParserMiddleware = (
	req: ReqQuery<FilterBlogQueries | FilteredBlogQueries>,
	res: Response,
	next: NextFunction,
) => {
	const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } =
		req.query as FilterBlogQueries;

	req.query = <FilteredBlogQueries>{
		...req.query,
		searchNameTerm: searchNameTerm ? searchNameTerm : null,
		sortBy: sortBy ? sortBy : 'createdAt',
		sortDirection: sortDirection ? sortDirection : 'desc',
		pageNumber: pageNumber ? +pageNumber : 1,
		pageSize: pageSize ? +pageSize : 10,
	};

	next();
};

export const queryUserParserMiddleware = (
	req: ReqQuery<FilterUserQueries | FilteredUserQueries>,
	res: Response,
	next: NextFunction,
) => {
	const { searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageSize, pageNumber } =
		req.query as FilterUserQueries;

	req.query = <FilteredUserQueries>{
		...req.query,
		searchLoginTerm: searchLoginTerm ? searchLoginTerm : null,
		searchEmailTerm: searchEmailTerm ? searchEmailTerm : null,
		sortBy: sortBy ? sortBy : 'createdAt',
		sortDirection: sortDirection ? sortDirection : 'desc',
		pageNumber: pageNumber ? +pageNumber : 1,
		pageSize: pageSize ? +pageSize : 10,
	};

	next();
};
