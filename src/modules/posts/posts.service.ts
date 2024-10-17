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

	getAllPosts(): PostViewDto[] | [] {
		const posts = this.postsRepository.getAllPosts();

		if (!posts.length) {
			return [];
		}

		const blogs = this.blogsRepository.getAllBlogs();

		return posts.map(post => ({
			...post,
			blogName: blogs.find(blog => blog.id === post.blogId)!.name,
		}));
	}

	getPostById(id: string): PostViewDto | void {
		const post = this.postsRepository.getPostById(id);

		if (!post) {
			return;
		}

		const blog = this.blogsRepository.getBlogById(post.blogId);

		return {...post, blogName: blog!.name}
	}

	updatePostById(id: string, updatedPost: PostUpdateDto): boolean {
		const post = this.postsRepository.getPostById(id);

		if(!post) {
			return false;
		}

		return this.postsRepository.updatePostById(id, updatedPost);
	}

	createPost({ content, title, shortDescription, blogId }: PostCreateDto): PostViewDto {
		const createdPost: PostModel = {
			id: new Date().getTime().toString(),
			title,
			content,
			shortDescription,
			blogId,
		};

		this.postsRepository.createPost(createdPost);
		const blogName = this.blogsRepository.getBlogById(blogId)!.name;

		return { ...createdPost, blogName };
	}

	deletePostById(id: string): boolean {
		return this.postsRepository.deletePostById(id);
	}
}

export const postsService = new PostsService(postsRepository, blogsRepository);
