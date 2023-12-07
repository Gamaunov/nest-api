import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';

import { BlogInputDTO } from '../../../../dto/blog-input.dto';
import { Blog, BlogModelType } from '../../../../blog.entity';
import { BlogsRepository } from '../../../../infrastructure/blogs.repository';

export class BlogCreateCommand {
  constructor(public blogInputDTO: BlogInputDTO) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string | null> {
    const blog = this.BlogModel.createBlog(
      this.BlogModel,
      command.blogInputDTO,
    );
    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
