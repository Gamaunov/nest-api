import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikesDataType } from '../../../../schemas/likes-data.type';
import { LikesService } from '../likes.service';
import { CommentsRepository } from '../../../../../comments/infrastructure/comments.repository';
import {
  Comment,
  CommentModelType,
} from '../../../../../comments/comment.entity';
import { LikeStatusInputDTO } from '../../../../dto/like-status-input.dto';

export class LikeUpdateForCommentCommand {
  constructor(
    public likeStatusInputDto: LikeStatusInputDTO,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(LikeUpdateForCommentCommand)
export class LikeUpdateForCommentUseCase
  implements ICommandHandler<LikeUpdateForCommentCommand>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute(command: LikeUpdateForCommentCommand): Promise<boolean | null> {
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );

    if (!comment) {
      return null;
    }

    const data: LikesDataType = {
      commentOrPostId: command.commentId,
      userId: command.userId,
      likeStatus: command.likeStatusInputDto.likeStatus,
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      model: this.CommentModel,
    };

    return this.likesService.updateLikesData(data);
  }
}