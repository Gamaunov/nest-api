import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { getLikeStatus } from '../../../base/utils/likes/getLikeStatus';
import {
  Comment,
  CommentDTOType,
  CommentModelType,
} from '../domain/comment.entity';
import { CommentQueryModel } from '../models/comment-query.model';
import { CommentViewModel } from '../models/comment.view.model';
import { Paginator } from '../../../base/pagination/_paginator';
import { paginateFeature } from '../../../base/pagination/paginate-feature';
import { commentsFilter } from '../../../base/pagination/comments-filter';
import { sortDirection } from '../../../base/pagination/sort-direction';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
  ) {}
  async findComments(
    query: CommentQueryModel,
    postId: string,
    userId: string,
  ): Promise<Paginator<CommentViewModel[]>> {
    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      return null;
    }

    const comments = await paginateFeature(
      this.CommentModel,
      query.pageNumber,
      query.pageSize,
      commentsFilter(postId),
      sortDirection(query.sortBy, query.sortDirection),
    );

    const totalCount = await this.CommentModel.countDocuments(
      commentsFilter(postId),
    );

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.commentsMapping(comments, userId),
    });
  }

  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    if (!mongoose.isValidObjectId(commentId)) {
      return null;
    }

    const comment = await this.CommentModel.findOne({ _id: commentId });

    if (!comment) {
      return null;
    }

    const status: string = getLikeStatus(comment, userId);

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: status,
      },
    };
  }

  private async commentsMapping(
    comments: CommentDTOType[],
    userId: string,
  ): Promise<CommentViewModel[]> {
    return Promise.all(
      comments.map(async (c) => {
        const status = getLikeStatus(c, userId);
        return {
          id: c._id.toString(),
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin,
          },
          createdAt: c.createdAt.toISOString(),
          likesInfo: {
            likesCount: c.likesInfo.likesCount,
            dislikesCount: c.likesInfo.dislikesCount,
            myStatus: status,
          },
        };
      }),
    );
  }
}
