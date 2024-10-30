import { PostCreateByBlogIdDto, PostUpdateDto, PostViewDto } from './posts.dto';
import { postsRepository, PostsRepository } from './posts.repository';
import { blogsRepository, BlogsRepository } from '../blogs/blogs.repository';
import { FilteredQueries, ItemsPaginationViewDto } from '../../types';

class PostsService {
	private postsRepository: PostsRepository;
	private blogsRepository: BlogsRepository;

	constructor(postsRepository: PostsRepository, blogsRepository: BlogsRepository) {
		this.postsRepository = postsRepository;
		this.blogsRepository = blogsRepository;
	}

	async getAllPosts(filter: FilteredQueries): Promise<ItemsPaginationViewDto<PostViewDto>> {
		const posts = await this.postsRepository.getAllPosts(filter);
		const postsCountByFilter = await this.postsRepository.getCountPosts();

		return {
			page: filter.pageNumber,
			pagesCount: Math.ceil(postsCountByFilter / filter.pageSize),
			pageSize: filter.pageSize,
			totalCount: postsCountByFilter,
			items: posts,
		};
	}

	async getPostById(id: string): Promise<PostViewDto | null> {
		return await this.postsRepository.getPostById(id);
	}

	async updatePostById(id: string, updatedPost: PostUpdateDto): Promise<boolean> {
		return this.postsRepository.updatePostById(id, updatedPost);
	}

	async createPost({
						 content,
						 title,
						 shortDescription,
						 blogId,
					 }: PostCreateByBlogIdDto): Promise<PostViewDto | null> {
		const blog = await this.blogsRepository.getBlogById(blogId);

		if(!blog) {
			return null;
		}

		const createdPost: PostViewDto = {
			id: new Date().getTime().toString(),
			title,
			content,
			shortDescription,
			blogId,
			blogName: blog!.name,
			createdAt: new Date().toISOString(),
		};

		await this.postsRepository.createPost(createdPost);

		return this.postsRepository.getPostById(createdPost.id);
	}

	deletePostById(id: string): Promise<boolean> {
		return this.postsRepository.deletePostById(id);
	}
}

export const postsService = new PostsService(postsRepository, blogsRepository);
