import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';
import { PostsRepository } from './posts.repository';
import { inject, injectable } from 'inversify';

@injectable()
export class PostsService {
	constructor(@inject(PostsRepository) private readonly postsRepository: PostsRepository) {}

	async updatePostById(id: string, updatedPost: PostUpdateDto): Promise<boolean> {
		const post = await this.postsRepository.getById(id);
		if (!post) {
			return false;
		}

		post.updatePost(updatedPost);
		await this.postsRepository.save(post);

		return true;
	}

	async createPost(newPost: PostCreateByBlogIdDto, blogName: string): Promise<{ id: string }> {
		const post = await this.postsRepository.create(newPost, blogName);
		return { id: post.id };
	}

	deletePostById(id: string): Promise<boolean> {
		return this.postsRepository.deleteById(id);
	}
}
