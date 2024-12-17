import { blogsRepository, BlogsRepository } from './blogs.repository';
import { postsRepository, PostsRepository } from '../posts/posts.repository';
import { BlogCreateDto, BlogUpdateDto } from './blogs.dto';
import { BlogCreate } from './blogs.types';

export class BlogsService {
	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly blogsRepository: BlogsRepository,
	) {}

	async updateBlogById(id: string, updatedBlog: BlogUpdateDto): Promise<boolean> {
		const blog = await this.blogsRepository.updateBlogById(id, updatedBlog);

		if (!blog) {
			return !!blog;
		}

		if (blog.name !== updatedBlog.name) {
			await this.postsRepository.updatePostsByBlogId(id, { name: updatedBlog.name });
		}

		return !!blog;
	}

	async createBlog({ name, websiteUrl, description }: BlogCreateDto): Promise<{ id: string }> {
		const id = new Date().getTime().toString();

		const createdBlog: BlogCreate = {
			id,
			name,
			websiteUrl,
			description,
			isMembership: false,
		};

		await this.blogsRepository.createBlog(createdBlog);

		return { id };
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
