import { blogsRepository, BlogsRepository } from './blogs.repository';
import { postsRepository, PostsRepository } from '../posts/posts.repository';
import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';

class BlogsService {
	private postsRepository: PostsRepository;
	private blogsRepository: BlogsRepository;

	constructor(postsRepository: PostsRepository, blogsRepository: BlogsRepository) {
		this.postsRepository = postsRepository;
		this.blogsRepository = blogsRepository;
	}

	getAllBlogs(): Promise<BlogViewDto[]> {
		return this.blogsRepository.getAllBlogs();
	}

	async getBlogById(id: string): Promise<BlogViewDto | null> {
		return this.blogsRepository.getBlogById(id);
	}

	async updateBlogById(id: string, updatedBlog: BlogUpdateDto): Promise<boolean> {
		return this.blogsRepository.updateBlogById(id, updatedBlog);
	}

	async createBlog({ name, websiteUrl, description }: BlogCreateDto): Promise<BlogViewDto> {
		const createdBlog: BlogViewDto = {
			id: new Date().getTime().toString(),
			name,
			websiteUrl,
			description,
			isMembership: false,
			createdAt: new Date().toISOString(),
		};

		return this.blogsRepository.createBlog(createdBlog);
	}

	async deleteBlogById(id: string): Promise<boolean> {
		const isDeleted = await this.blogsRepository.deleteBlogById(id);

		if (isDeleted) {
			await this.postsRepository.deleteAllPostsByBlogId(id);
		}

		return isDeleted;
	}
}

export const blogsService = new BlogsService(postsRepository, blogsRepository);
