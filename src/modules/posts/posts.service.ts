import { PostCreateByBlogId, PostUpdateDto } from './posts.dto';
import { PostsRepository } from './posts.repository';
import { inject, injectable } from 'inversify';
import { PostsModel } from './posts.model';

@injectable()
export class PostsService {
	constructor(@inject(PostsRepository) private readonly postsRepository: PostsRepository) {}

	async updatePostById(id: string, updatedPost: PostUpdateDto): Promise<boolean> {
		const post = await this.postsRepository.getPostById(id);
		if (!post) {
			return false;
		}

		post.updatePost(updatedPost);
		await this.postsRepository.save(post);

		return true;
	}

	async createPost(newPost: PostCreateByBlogId): Promise<{ id: string }> {
		const post = PostsModel.getInstance(newPost);
		await this.postsRepository.save(post);
		return { id: post.id };
	}

	deletePostById(id: string): Promise<boolean> {
		return this.postsRepository.deletePostById(id);
	}
}
