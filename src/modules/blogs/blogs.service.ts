import { blogsRepository, BlogsRepository } from './blogs.repository';
import { postsRepository, PostsRepository } from '../posts/posts.repository';
import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { FilteredQueries, ItemsPaginationViewDto } from '../../types';
import { PostCreateDto, PostViewDto } from '../posts/posts.dto';
import { postsService } from '../posts/posts.service';

class BlogsService {
	private postsRepository: PostsRepository;
	private blogsRepository: BlogsRepository;

	constructor(postsRepository: PostsRepository, blogsRepository: BlogsRepository) {
		this.postsRepository = postsRepository;
		this.blogsRepository = blogsRepository;
	}

	async getAllBlogs(filter: FilteredQueries): Promise<ItemsPaginationViewDto<BlogViewDto>> {
		const blogs = await this.blogsRepository.getAllBlogs(filter);
		const blogsCountByFilter = await this.blogsRepository.getCountBlogsByFilter(filter.searchNameTerm);

		return {
			page: filter.pageNumber,
			pagesCount: Math.ceil(blogsCountByFilter / filter.pageSize),
			pageSize: filter.pageSize,
			totalCount: blogsCountByFilter,
			items: blogs,
		};
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

	async getPostsByBlogId(id: string, filterPagination: FilteredQueries): Promise<ItemsPaginationViewDto<PostViewDto> | null> {
		const blog = await this.blogsRepository.getBlogById(id);

		if (!blog) {
			return null;
		}

		const posts = await this.postsRepository.getAllPosts(filterPagination, { blogId: blog.id });
		const postsCountByBlogId = await this.postsRepository.getCountPosts({blogId: blog.id});

		return {
			page: filterPagination.pageNumber,
			pagesCount: Math.ceil(postsCountByBlogId / filterPagination.pageSize),
			pageSize: filterPagination.pageSize,
			totalCount: postsCountByBlogId,
			items: posts,
		};
	}

	async createPostByBlogId(id: string, newPost: PostCreateDto): Promise<PostViewDto | null> {
		return postsService.createPost({...newPost, blogId: id})
	}
}

export const blogsService = new BlogsService(postsRepository, blogsRepository);
