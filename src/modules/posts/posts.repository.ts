import { PostUpdateDto, PostModel } from './posts.dto';

export class PostsRepository {
	private posts: PostModel[] = [];

	public getAllPosts(): PostModel[] {
		return this.posts;
	}

	public deleteAllPostsByBlogId(blogId: string): void {
		this.posts = this.posts.filter(post => post.blogId !== blogId);
	}

	public getPostById(id: string): PostModel | void {
		return this.posts.find(post => post.id === id);
	}

	public updatePostById(id: string, newPost: PostUpdateDto): boolean {
		this.posts = this.posts.map(post => {
			if (post.id === id) {
				return { ...post, ...newPost };
			}

			return post;
		});

		return true;
	}

	public createPost(createdPost: PostModel): PostModel {
		this.posts.push(createdPost);
		return createdPost;
	}

	public deletePostById(id: string): boolean {
		const currentPostIndex = this.posts.findIndex(video => video.id === id);
		if (currentPostIndex === -1) {
			return false;
		}

		this.posts.splice(currentPostIndex, 1);

		return true;
	}

	public deleteAllPosts(): void {
		this.posts = [];
	}
}

const postsRepository = new PostsRepository();

export { postsRepository };
