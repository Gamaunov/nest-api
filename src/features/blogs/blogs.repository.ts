import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Blog, BlogDocument, BlogModelType } from './schemas/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async save(blog: BlogDocument) {
    return blog.save();
  }

  async findBlog(id: string): Promise<BlogDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundException();
    }

    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  async createBlog(blog: BlogDocument) {
    await blog.save();
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

  async deleteBlog(id: string): Promise<boolean> {
    const blog = await this.BlogModel.deleteOne({ _id: id });
    return blog.deletedCount === 1;
  }

  async deleteBlogs(): Promise<boolean> {
    await this.BlogModel.deleteMany({});
    return (await this.BlogModel.countDocuments()) === 0;
  }
}