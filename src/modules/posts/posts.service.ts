import { PostCreateDto, PostUpdateDto, PostViewDto, PostModel } from './posts.dto';
import { postsRepository, PostsRepository } from './posts.repository';
import { blogsRepository, BlogsRepository } from '../blogs/blogs.repository';

class PostsService {
	private postsRepository: PostsRepository;
	private blogsRepository: BlogsRepository;

	constructor(postsRepository: PostsRepository, blogsRepository: BlogsRepository) {
		this.postsRepository = postsRepository;
		this.blogsRepository = blogsRepository;
	}

	async getAllPosts(): Promise<PostViewDto[] | []> {
		const posts = await this.postsRepository.getAllPosts();

		if (!posts.length) {
			return [];
		}

		const blogs = await this.blogsRepository.getAllBlogs();

		return posts.map(post => ({
			...post,
			blogName: blogs.find(blog => blog.id === post.blogId)!.name,
		}));
	}

	async getPostById(id: string): Promise<PostViewDto | void> {
		const post = await this.postsRepository.getPostById(id);

		if (!post) {
			return;
		}

		const blog = await this.blogsRepository.getBlogById(post.blogId);

		return { ...post, blogName: blog!.name };
	}

	async updatePostById(id: string, updatedPost: PostUpdateDto): Promise<boolean> {
		const post = await this.postsRepository.getPostById(id);

		if (!post) {
			return false;
		}

		return this.postsRepository.updatePostById(id, updatedPost);
	}

	async createPost({
		content,
		title,
		shortDescription,
		blogId,
	}: PostCreateDto): Promise<PostViewDto> {
		const createdPost: PostModel = {
			id: new Date().getTime().toString(),
			title,
			content,
			shortDescription,
			blogId,
			createdAt: new Date().toISOString(),
		};

		await this.postsRepository.createPost(createdPost);
		const blog = await this.blogsRepository.getBlogById(blogId);
		const currentPost = await this.postsRepository.getPostById(createdPost.id);

		return { ...currentPost!, blogName: blog!.name };
	}

	deletePostById(id: string): Promise<boolean> {
		return this.postsRepository.deletePostById(id);
	}
}

export const postsService = new PostsService(postsRepository, blogsRepository);
