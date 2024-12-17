import { Router } from 'express';
import { FilteredUserQueries } from '../../types';
import { stringMiddleware, fieldsCheckErrorsMiddleware } from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryUserParserMiddleware } from '../../middlewares/queryParser.middleware';
import { patternMiddleware, PATTERNS } from '../../middlewares/validation/pattern.middleware';
import { usersController } from './users.controller';

export const usersRouter = Router();
const validationMiddlewares = [
	authMiddleware,
	stringMiddleware({ field: 'login', maxLength: 10, minLength: 3 }),
	patternMiddleware('login', PATTERNS.LOGIN),
	stringMiddleware({ field: 'password', maxLength: 20, minLength: 6 }),
	stringMiddleware({ field: 'email' }),
	patternMiddleware('email', PATTERNS.EMAIL),
	fieldsCheckErrorsMiddleware,
];

usersRouter.get(
	'/',
	authMiddleware<FilteredUserQueries>,
	queryUserParserMiddleware,
	usersController.getAllUsers,
);
usersRouter.post('/', ...validationMiddlewares, usersController.createUser);
usersRouter.delete('/:id', authMiddleware, usersController.deleteUserById);
