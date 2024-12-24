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

export const compositionRoot = new Container();

// Blogs
compositionRoot.bind<BlogsController>(BlogsController).to(BlogsController);
compositionRoot.bind<BlogsQueryRepository>(BlogsQueryRepository).to(BlogsQueryRepository);
compositionRoot.bind<BlogsRepository>(BlogsRepository).to(BlogsRepository);
compositionRoot.bind<BlogsService>(BlogsService).to(BlogsService);

// Posts
compositionRoot.bind<PostsController>(PostsController).to(PostsController);
compositionRoot.bind<PostsQueryRepository>(PostsQueryRepository).to(PostsQueryRepository);
compositionRoot.bind<PostsRepository>(PostsRepository).to(PostsRepository);
compositionRoot.bind<PostsService>(PostsService).to(PostsService);

// Users
compositionRoot.bind<UsersController>(UsersController).to(UsersController);
compositionRoot.bind<UsersQueryRepository>(UsersQueryRepository).to(UsersQueryRepository);
compositionRoot.bind<UsersRepository>(UsersRepository).to(UsersRepository);
compositionRoot.bind<UsersService>(UsersService).to(UsersService);

// Comments
compositionRoot.bind<CommentsController>(CommentsController).to(CommentsController);
compositionRoot.bind<CommentsQueryRepository>(CommentsQueryRepository).to(CommentsQueryRepository);
compositionRoot.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository);
compositionRoot.bind<CommentsService>(CommentsService).to(CommentsService);

// Auth
compositionRoot.bind<AuthService>(AuthService).to(AuthService);
compositionRoot.bind<AuthController>(AuthController).to(AuthController);

// SecurityDevices
compositionRoot
	.bind<SecurityDevicesController>(SecurityDevicesController)
	.to(SecurityDevicesController);
compositionRoot
	.bind<SecurityDevicesQueryRepository>(SecurityDevicesQueryRepository)
	.to(SecurityDevicesQueryRepository);
compositionRoot
	.bind<SecurityDevicesRepository>(SecurityDevicesRepository)
	.to(SecurityDevicesRepository);
compositionRoot.bind<SecurityDevicesService>(SecurityDevicesService).to(SecurityDevicesService);

// Adapters
compositionRoot.bind<EmailAdapter>(EmailAdapter).to(EmailAdapter);
