import { Container } from 'inversify';
import { BlogsController } from './modules/blogs/blogs.controller';
import { BlogsQueryRepository } from './modules/blogs/blogs.query-repository';
import { BlogsRepository } from './modules/blogs/blogs.repository';
import { BlogsService } from './modules/blogs/blogs.service';
import { PostsController } from './modules/posts/posts.controller';
import { PostsQueryRepository } from './modules/posts/posts.query-repository';
import { PostsRepository } from './modules/posts/posts.repository';
import { PostsService } from './modules/posts/posts.service';
import { UsersController } from './modules/users/users.controller';
import { UsersQueryRepository } from './modules/users/users.query-repository';
import { UsersRepository } from './modules/users/users.repository';
import { UsersService } from './modules/users/users.service';
import { CommentsController } from './modules/comments/comments.controller';
import { CommentsQueryRepository } from './modules/comments/comments.query-repository';
import { CommentsRepository } from './modules/comments/comments.repository';
import { CommentsService } from './modules/comments/comments.service';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { EmailAdapter } from './adapters/emailAdapter';
import { SecurityDevicesController } from './modules/securityDevices/securityDevices.controller';
import { SecurityDevicesQueryRepository } from './modules/securityDevices/securityDevices.query-repository';
import { SecurityDevicesRepository } from './modules/securityDevices/securityDevices.repository';
import { SecurityDevicesService } from './modules/securityDevices/securityDevices.service';
import { LikesPostRepository } from './modules/likesPost/likesPost.repository';
import { LikesPostService } from './modules/likesPost/likesPost.service';
import { LikesPostQueryRepository } from './modules/likesPost/likesPost.query-repository';

export const compositionRoot = new Container();

// Blogs
compositionRoot.bind<BlogsController>(BlogsController).to(BlogsController).inSingletonScope();
compositionRoot
	.bind<BlogsQueryRepository>(BlogsQueryRepository)
	.to(BlogsQueryRepository)
	.inSingletonScope();
compositionRoot.bind<BlogsRepository>(BlogsRepository).to(BlogsRepository).inSingletonScope();
compositionRoot.bind<BlogsService>(BlogsService).to(BlogsService).inSingletonScope();

// Posts
compositionRoot.bind<PostsController>(PostsController).to(PostsController).inSingletonScope();
compositionRoot
	.bind<PostsQueryRepository>(PostsQueryRepository)
	.to(PostsQueryRepository)
	.inSingletonScope();
compositionRoot.bind<PostsRepository>(PostsRepository).to(PostsRepository).inSingletonScope();
compositionRoot.bind<PostsService>(PostsService).to(PostsService).inSingletonScope();

// Users
compositionRoot.bind<UsersController>(UsersController).to(UsersController).inSingletonScope();
compositionRoot
	.bind<UsersQueryRepository>(UsersQueryRepository)
	.to(UsersQueryRepository)
	.inSingletonScope();
compositionRoot.bind<UsersRepository>(UsersRepository).to(UsersRepository).inSingletonScope();
compositionRoot.bind<UsersService>(UsersService).to(UsersService).inSingletonScope();

// Comments
compositionRoot
	.bind<CommentsController>(CommentsController)
	.to(CommentsController)
	.inSingletonScope();
compositionRoot
	.bind<CommentsQueryRepository>(CommentsQueryRepository)
	.to(CommentsQueryRepository)
	.inSingletonScope();
compositionRoot
	.bind<CommentsRepository>(CommentsRepository)
	.to(CommentsRepository)
	.inSingletonScope();
compositionRoot.bind<CommentsService>(CommentsService).to(CommentsService).inSingletonScope();

// Auth
compositionRoot.bind<AuthService>(AuthService).to(AuthService).inSingletonScope();
compositionRoot.bind<AuthController>(AuthController).to(AuthController).inSingletonScope();

// SecurityDevices
compositionRoot
	.bind<SecurityDevicesController>(SecurityDevicesController)
	.to(SecurityDevicesController)
	.inSingletonScope();
compositionRoot
	.bind<SecurityDevicesQueryRepository>(SecurityDevicesQueryRepository)
	.to(SecurityDevicesQueryRepository)
	.inSingletonScope();
compositionRoot
	.bind<SecurityDevicesRepository>(SecurityDevicesRepository)
	.to(SecurityDevicesRepository)
	.inSingletonScope();
compositionRoot
	.bind<SecurityDevicesService>(SecurityDevicesService)
	.to(SecurityDevicesService)
	.inSingletonScope();

// LikesPost
compositionRoot.bind<LikesPostService>(LikesPostService).to(LikesPostService).inSingletonScope();
compositionRoot
	.bind<LikesPostRepository>(LikesPostRepository)
	.to(LikesPostRepository)
	.inSingletonScope();
compositionRoot
	.bind<LikesPostQueryRepository>(LikesPostQueryRepository)
	.to(LikesPostQueryRepository)
	.inSingletonScope();

// Adapters
compositionRoot.bind<EmailAdapter>(EmailAdapter).to(EmailAdapter).inSingletonScope();
