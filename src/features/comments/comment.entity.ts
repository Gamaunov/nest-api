import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { PostDocument } from '../posts/post.entity';
import { UserDocument } from '../users/user.entity';
import { LikesInfoSchema } from '../likes/schemas/likes-info.schema';

import { CommentInputDTO } from './dto/comment-input.dto';
import { CommentatorInfoSchema } from './schemas/commentator.info.schema';

interface IUpdateCommentDTO {
  content: string;
}

export type CommentDocument = HydratedDocument<Comment>;
export type CommentDTOType = Comment & { _id: Types.ObjectId };

export type CommentModelStaticType = {
  createComment: (
    CommentModel: CommentModelType,
    commentInputDTO: CommentInputDTO,
    post: PostDocument,
    user: UserDocument,
  ) => CommentDocument;
};

export type CommentModelType = Model<Comment> & CommentModelStaticType;

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfoSchema;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  likesInfo: LikesInfoSchema;

  updateComment(updateCommentDTO: IUpdateCommentDTO): void {
    this.content = updateCommentDTO.content;
  }

  static createComment(
    CommentModel: CommentModelType,
    commentInputDTO: CommentInputDTO,
    post: PostDocument,
    user: UserDocument,
  ): CommentDocument {
    const comment = {
      content: commentInputDTO.content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.accountData.login,
      },
      postId: post._id.toString(),
      createdAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        users: [],
      },
    };
    return new CommentModel(comment);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
};

const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;