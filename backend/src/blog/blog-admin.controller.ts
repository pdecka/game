import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { BlogService } from './blog.service';
import { BlogPostStatus } from './blog.enums';

@Controller('admin/blogs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async list() {
    return this.blogService.adminList();
  }

  @Post()
  async create(
    @Body()
    body: {
      title: string;
      slug?: string;
      content: string;
      imageUrl?: string;
      status?: BlogPostStatus;
    },
  ) {
    return this.blogService.adminCreate(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ title: string; slug: string; content: string; imageUrl: string; status: BlogPostStatus }>,
  ) {
    return this.blogService.adminUpdate(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.adminDelete(id);
  }
}
