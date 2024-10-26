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

	async getBlogById(id: string): Promise<BlogViewDto | void> {
		const blog = await this.blogsRepository.getBlogById(id);

		if (!blog) {
			return;
		}

		return blog;
	}

	async updateBlogById(id: string, updatedBlog: BlogUpdateDto): Promise<boolean> {
		const post = this.blogsRepository.getBlogById(id);

		if (!post) {
			return false;
		}

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
		const isDeleted = this.blogsRepository.deleteBlogById(id);

		if (!isDeleted) {
			return isDeleted;
		}

		return this.postsRepository.deleteAllPostsByBlogId(id);
	}
}

export const blogsService = new BlogsService(postsRepository, blogsRepository);
