import { NextFunction, Response } from 'express';
import { FilteredQueries, FilterQueries, ReqQuery } from '../types';

export const queryParserMiddleware = (req: ReqQuery<FilterQueries | FilteredQueries>, res: Response, next: NextFunction) => {
	const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } = req.query as FilterQueries;

	req.query = <FilteredQueries>{
		...req.query,
		searchNameTerm: searchNameTerm ? searchNameTerm : null,
		sortBy: sortBy ? sortBy : 'createdAt',
		sortDirection: sortDirection ? sortDirection : 'desc',
		pageNumber: pageNumber ? +pageNumber : 1,
		pageSize: pageSize ? +pageSize : 10,
	};

	next();
};
