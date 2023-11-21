import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CreatePostDTO } from '../dto/create-post.dto';
import { BlogDocument } from '../../blogs/schemas/blog.entity';
import { LikesInfoSchema } from '../../../shared/schemas/likes-info.schema';

export type PostDocument = HydratedDocument<Post>;

export type PostModelStaticType = {
  createPost: (
    createPostDTO: CreatePostDTO,
    PostModel: PostModelType,
    blog: BlogDocument,
  ) => PostDocument;
};

export type PostModelType = Model<Post> & PostModelStaticType;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  extendedLikesInfo: LikesInfoSchema;

  updatePost(updatePostDTO) {
    this.title = updatePostDTO.title;
    this.shortDescription = updatePostDTO.shortDescription;
    this.content = updatePostDTO.content;
    this.blogId = updatePostDTO.blogId;
  }

  static createPost(
    createPostDTO: CreatePostDTO,
    PostModel: PostModelType,
    blog: BlogDocument,
  ): PostDocument {
    const post = {
      title: createPostDTO.title,
      shortDescription: createPostDTO.shortDescription,
      content: createPostDTO.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new PostModel(post);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
};

const postStaticMethods: PostModelStaticType = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;