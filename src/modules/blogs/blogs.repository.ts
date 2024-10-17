import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';

export class BlogsRepository {
	private blogs: BlogViewDto[] = [];

	public getAllBlogs(): BlogViewDto[] {
		return this.blogs;
	}

	public getBlogById(id: string): BlogViewDto | void {
		return this.blogs.find(blog => blog.id === id);
	}

	public updateBlogById(id: string, newBlog: BlogUpdateDto): boolean {
		this.blogs = this.blogs.map(blog => {
			if (blog.id === id) {
				return { ...blog, ...newBlog };
			}

			return blog;
		});

		return true;
	}

	public createBlog({ name, websiteUrl, description }: BlogCreateDto): BlogViewDto {

		const createdBlog: BlogViewDto = {
			id: new Date().getTime().toString(),
			name,
			websiteUrl,
			description,
		};

		this.blogs.push(createdBlog);

		return createdBlog;
	}

	public deleteBlogById(id: string): boolean {
		const currentBlogIndex = this.blogs.findIndex(video => video.id === id);
		if (currentBlogIndex === -1) {
			return false;
		}

		this.blogs.splice(currentBlogIndex, 1);

		return true;
	}

	public deleteAllBlogs(): void {
		this.blogs = [];
	}
}

const blogsRepository = new BlogsRepository();

export { blogsRepository };
