import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  async list() {
    return this.blogService.listPublished();
  }

  @Get('posts/:slug')
  async getOne(@Param('slug') slug: string) {
    return this.blogService.getPublishedBySlug(slug);
  }
}
