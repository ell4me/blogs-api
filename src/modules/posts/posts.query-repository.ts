import { PostViewDto } from './posts.dto';
import { postsCollection } from '../../helpers/runDb';
import { Filter } from 'mongodb';
import { FilteredBlogQueries, ItemsPaginationViewDto } from '../../types';

export class PostsQueryRepository {
	public async getAllPosts({
								 pageSize,
								 pageNumber,
								 sortBy,
								 sortDirection,
							 }: FilteredBlogQueries, additionalFilter?: Filter<PostViewDto>): Promise<ItemsPaginationViewDto<PostViewDto>> {
		const posts = await postsCollection.find(additionalFilter ? additionalFilter : {}, { projection: { _id: false } })
			.skip((pageNumber - 1) * pageSize)
			.sort({ [sortBy]: sortDirection })
			.limit(pageSize)
			.toArray();
		const postsCountByFilter = await this.getCountPosts(additionalFilter);

		return {
			page: pageNumber,
			pagesCount: Math.ceil(postsCountByFilter / pageSize),
			pageSize,
			totalCount: postsCountByFilter,
			items: posts,
		};
	}

	public getPostById(id: string): Promise<PostViewDto | null> {
		return postsCollection.findOne({ id }, { projection: { _id: false } });
	}

	public getCountPosts(filter?: Filter<PostViewDto>): Promise<number> {
		return postsCollection.countDocuments(filter ? filter : {});
	}
}

const postsQueryRepository = new PostsQueryRepository();

export { postsQueryRepository };
