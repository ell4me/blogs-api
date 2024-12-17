import { Response } from 'express';
import { FilteredUserQueries, ReqBody, ReqParams, ReqQuery } from '../../types';
import { usersQueryRepository } from './users.query-repository';
import { HTTP_STATUSES } from '../../constants';
import { UserCreateDto } from './users.dto';
import { usersService } from './users.service';

class UsersController {
	async getAllUsers(req: ReqQuery<FilteredUserQueries>, res: Response) {
		try {
			const users = await usersQueryRepository.getAllUsers(req.query);
			res.send(users);
		} catch (e) {
			res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_500);
		}
	}

	async createUser(req: ReqBody<UserCreateDto>, res: Response) {
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
	}

	async deleteUserById(req: ReqParams<{ id: string }>, res: Response) {
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
	}
}

export const usersController = new UsersController();
