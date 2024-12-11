import { Router } from 'express';
import { FilteredUserQueries, ReqBody, ReqParams, ReqQuery } from '../../types';
import { HTTP_STATUSES } from '../../constants';
import { stringMiddleware, fieldsCheckErrorsMiddleware } from '../../middlewares/validation';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { queryUserParserMiddleware } from '../../middlewares/queryParser.middleware';
import { UserCreateDto } from './users.dto';
import { patternMiddleware, PATTERNS } from '../../middlewares/validation/pattern.middleware';
import { usersQueryRepository } from './users.query-repository';
import { usersService } from './users.service';

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
	async (req: ReqQuery<FilteredUserQueries>, res) => {
		try {
			const users = await usersQueryRepository.getAllUsers(req.query);
			res.send(users);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	},
);

usersRouter.post('/', ...validationMiddlewares, async (req: ReqBody<UserCreateDto>, res) => {
	try {
		const result = await usersService.createUser(req.body);

		if ('errorsMessages' in result) {
			res.status(HTTP_STATUSES.BAD_REQUEST_400).send(result.errorsMessages);
			return;
		}

		const user = await usersQueryRepository.getUserById(result.id);
		res.status(HTTP_STATUSES.CREATED_201).send(user!);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});

usersRouter.delete('/:id', authMiddleware, async (req: ReqParams<{ id: string }>, res) => {
	try {
		const isDeleted = await usersService.deleteUserById(req.params.id);

		if (!isDeleted) {
			res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
			return;
		}

		res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
	} catch (e) {
		res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
	}
});
