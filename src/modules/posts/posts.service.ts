import { PostCreateByBlogId, PostUpdateDto } from './posts.dto';
import { PostsRepository } from './posts.repository';
import { PostCreate } from './posts.types';
import { inject, injectable } from 'inversify';

@injectable()
export class PostsService {
	constructor(@inject(PostsRepository) private readonly postsRepository: PostsRepository) {}

	async updatePostById(id: string, updatedPost: PostUpdateDto): Promise<boolean> {
		return this.postsRepository.updatePostById(id, updatedPost);
	}

	async createPost({
		content,
		title,
		shortDescription,
		blogId,
		blogName,
	}: PostCreateByBlogId): Promise<{ id: string }> {
		const id = new Date().getTime().toString();

		const createdPost: PostCreate = {
			id,
			title,
			content,
			shortDescription,
			blogId,
			blogName,
		};

		await this.postsRepository.createPost(createdPost);

		return { id };
	}

	deletePostById(id: string): Promise<boolean> {
		return this.postsRepository.deletePostById(id);
	}
}
