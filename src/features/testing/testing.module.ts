import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from '../blogs/schemas/blog.entity';
import { Post, PostSchema } from '../posts/schemas/post.entity';
import { Comment, CommentSchema } from '../comments/schemas/comment.entity';
import { User, UserSchema } from '../users/schemas/user.entity';

import { TestingController } from './testing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}