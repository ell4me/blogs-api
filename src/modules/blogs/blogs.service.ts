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

	getAllBlogs(): BlogViewDto[] {
		return this.blogsRepository.getAllBlogs();
	}

	getBlogById(id: string): BlogViewDto | void {
		const blog = this.blogsRepository.getBlogById(id);

		if (!blog) {
			return;
		}

		return blog;
	}

	updateBlogById(id: string, updatedBlog: BlogUpdateDto): boolean {
		const post = this.blogsRepository.getBlogById(id);

		if (!post) {
			return false;
		}

		return this.blogsRepository.updateBlogById(id, updatedBlog);
	}

	createBlog({ name, websiteUrl, description }: BlogCreateDto): BlogViewDto {
		const createdBlog: BlogViewDto = {
			id: new Date().getTime().toString(),
			name,
			websiteUrl,
			description,
		};

		return this.blogsRepository.createBlog(createdBlog);
	}

	deleteBlogById(id: string): boolean {
		const isDeleted = this.blogsRepository.deleteBlogById(id);

		if(!isDeleted) {
			return isDeleted;
		}

		this.postsRepository.deleteAllPostsByBlogId(id);

		return isDeleted;
	}
}

export const blogsService = new BlogsService(postsRepository, blogsRepository);
