import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';

import { Blog, BlogSchema } from '../../features/blogs/domain/blog.entity';
import { Post, PostSchema } from '../../features/posts/domain/post.entity';
import {
  Comment,
  CommentSchema,
} from '../../features/comments/domain/comment.entity';
import { User, UserSchema } from '../../features/users/domain/user.entity';
import { TokenParserMiddleware } from '../../infrastructure/middlewares/token-parser.middleware';
import { BloggerBlogsController } from '../../features/blogs/api/blogger/blogger.blogs.controller';
import { PublicPostsController } from '../../features/posts/api/public/public.posts.controller';
import { PublicCommentsController } from '../../features/comments/api/public/public.comments.controller';
import { BlogsRepository } from '../../features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../features/blogs/infrastructure/blogs.query.repository';
import { CommentsRepository } from '../../features/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../features/comments/infrastructure/comments.query.repository';
import { UsersRepository } from '../../features/users/infrastructure/users.repository';
import { SuperAdminBlogsController } from '../../features/blogs/api/superadmin/sa.blogs.controller';
import { PublicBlogsController } from '../../features/blogs/api/public/public.blogs.controller';
import { LikesService } from '../../features/likes/api/public/application/likes.service';
import { BlogBindUseCase } from '../../features/blogs/api/superadmin/application/use-cases/blog-bind.use-case';
import { BlogUpdateUseCase } from '../../features/blogs/api/blogger/application/use-cases/blog-update.use-case';
import { BlogDeleteUseCase } from '../../features/blogs/api/blogger/application/use-cases/blog-delete.use-case';
import { CommentCreateUseCase } from '../../features/comments/api/public/application/use-cases/comment-create.use-case';
import { CommentUpdateUseCase } from '../../features/comments/api/public/application/use-cases/comment-update.use-case';
import { CommentDeleteUseCase } from '../../features/comments/api/public/application/use-cases/comment-delete.use-case';
import { LikeUpdateForPostUseCase } from '../../features/likes/api/public/application/use-cases/like-update-for-post-use.case';
import { LikeUpdateForCommentUseCase } from '../../features/likes/api/public/application/use-cases/like-update-for-comment-use.case';
import { BlogCreateUseCase } from '../../features/blogs/api/blogger/application/use-cases/blog-create.use-case';
import { LikesRepository } from '../../features/likes/infrastructure/likes.repository';
import { JwtBearerGuard } from '../../features/auth/guards/jwt-bearer.guard';
import { PostsRepository } from '../../features/posts/infrastructure/posts.repository';
import { PostCreateUseCase } from '../../features/posts/api/blogger/application/use-cases/post-create.use-case';
import { PostDeleteUseCase } from '../../features/posts/api/blogger/application/use-cases/post-delete.use-case';
import { PostUpdateUseCase } from '../../features/posts/api/blogger/application/use-cases/post-update.use-case';
import { PostsQueryRepository } from '../../features/posts/infrastructure/posts.query.repository';
import { IsBlogExistConstraint } from '../../infrastructure/decorators/is-blog-exist.decorator';

const controllers = [
  SuperAdminBlogsController,
  BloggerBlogsController,
  PublicBlogsController,
  PublicCommentsController,
  PublicPostsController,
];

const services = [LikesService, JwtService];

const useCases = [
  BlogBindUseCase,
  BlogCreateUseCase,
  BlogUpdateUseCase,
  BlogDeleteUseCase,
  CommentCreateUseCase,
  CommentUpdateUseCase,
  CommentDeleteUseCase,
  LikeUpdateForPostUseCase,
  LikeUpdateForCommentUseCase,
  PostCreateUseCase,
  PostDeleteUseCase,
  PostUpdateUseCase,
];

const repositories = [
  BlogsRepository,
  CommentsRepository,
  UsersRepository,
  PostsRepository,
  LikesRepository,
];

const queryRepositories = [
  BlogsQueryRepository,
  CommentsQueryRepository,
  PostsQueryRepository,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CqrsModule,
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...queryRepositories,
    JwtBearerGuard,
    IsBlogExistConstraint,
  ],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenParserMiddleware)
      .forRoutes(
        { path: 'blogs/:id/posts', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'posts/:id', method: RequestMethod.GET },
        { path: 'posts/:id/comments', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
      );
  }
}
