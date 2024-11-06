import { PostCreateByBlogId, PostUpdateDto, PostViewDto } from './posts.dto';
import { postsRepository, PostsRepository } from './posts.repository';
import { blogsRepository, BlogsRepository } from '../blogs/blogs.repository';

class PostsService {
	private postsRepository: PostsRepository;
	private blogsRepository: BlogsRepository;

	constructor(postsRepository: PostsRepository, blogsRepository: BlogsRepository) {
		this.postsRepository = postsRepository;
		this.blogsRepository = blogsRepository;
	}

	async updatePostById(id: string, updatedPost: PostUpdateDto): Promise<boolean> {
		return this.postsRepository.updatePostById(id, updatedPost);
	}

	async createPost({
						 content,
						 title,
						 shortDescription,
						 blogId,
						 blogName,
					 }: PostCreateByBlogId): Promise<{ id: string }> {
		const id = new Date().getTime().toString();

		const createdPost: PostViewDto = {
			id,
			title,
			content,
			shortDescription,
			blogId,
			blogName,
			createdAt: new Date().toISOString(),
		};

		await this.postsRepository.createPost(createdPost);

		return { id };
	}

	deletePostById(id: string): Promise<boolean> {
		return this.postsRepository.deletePostById(id);
	}
}

export const postsService = new PostsService(postsRepository, blogsRepository);
