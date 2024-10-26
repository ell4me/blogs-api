import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorMessage } from '../../types';
import { HTTP_STATUSES } from '../../constants';

export const fieldsCheckErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const result = validationResult(req).formatWith<ErrorMessage>(error => ({
		field: error.type === 'field' ? error.path : 'Unknown field',
		message: error.msg,
	}));

	if (!result.isEmpty()) {
		res.status(HTTP_STATUSES.BAD_REQUEST_400).send({
			errorsMessages: result.array({ onlyFirstError: true }),
		});

		return;
	}

	next();
};
