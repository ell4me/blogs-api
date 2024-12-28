import { Schema, model, HydratedDocument, Model } from 'mongoose';
import { MODELS_NAMES } from '../../constants';
import { PostCreateByBlogIdDto, PostUpdateDto } from './posts.dto';

export interface Post {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	createdAt: Date;
	updatedAt: Date;
}

interface PostDocumentMethods {
	updatePost: (post: PostUpdateDto) => void;
}

type PostModel = Model<Post, {}, PostDocumentMethods> & {
	getInstance: (
		post: PostCreateByBlogIdDto,
		blogName: string,
		PostModel: PostModel,
	) => PostDocument;
};

export interface PostDocument extends HydratedDocument<Post, PostDocumentMethods> {}

const postsSchema = new Schema<Post, PostModel, PostDocumentMethods>(
	{
		id: { type: String, required: true },
		title: { type: String, required: true },
		shortDescription: { type: String, required: true },
		content: { type: String, required: true },
		blogId: { type: String, required: true },
		blogName: { type: String, required: true },
	},
	{ timestamps: true },
);

postsSchema.method('updatePost', function updatePost(post: PostUpdateDto) {
	this.blogId = post.blogId;
	this.content = post.content;
	this.title = post.title;
	this.shortDescription = post.shortDescription;
});

postsSchema.static(
	'getInstance',
	function getInstance(
		{ title, content, shortDescription, blogId }: PostCreateByBlogIdDto,
		blogName: string,
		PostModel: PostModel,
	) {
		return new PostModel({
			id: new Date().getTime().toString(),
			title,
			content,
			shortDescription,
			blogId,
			blogName,
		});
	},
);

export const PostsModel = model<Post, PostModel>(MODELS_NAMES.POSTS, postsSchema);
