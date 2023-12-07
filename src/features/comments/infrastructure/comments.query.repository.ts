import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { getLikeStatus } from '../../likes/utils/getLikeStatus';
import { Comment, CommentDtoType, CommentModelType } from '../comment.entity';
import { CommentQuery } from '../dto/comment.query';
import { CommentViewDto } from '../dto/comment-view.dto';
import { Paginator } from '../../../shared/pagination/_paginator';
import { paginateFeature } from '../../../shared/pagination/paginate-feature';
import { commentsFilter } from '../../../shared/pagination/comments-filter';
import { sortDirection } from '../../../shared/pagination/sort-direction';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
  ) {}
  async findComments(
    query: CommentQuery,
    postId: string,
    userId: string,
  ): Promise<Paginator<CommentViewDto[]>> {
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
  ): Promise<CommentViewDto | null> {
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
    comments: CommentDtoType[],
    userId: string,
  ): Promise<CommentViewDto[]> {
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
