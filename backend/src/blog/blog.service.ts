import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogPostStatus } from './blog.enums';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    return this.prisma.blogPost.findMany({
      where: { status: BlogPostStatus.PUBLISHED as any },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: BlogPostStatus.PUBLISHED as any },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async adminList() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async adminCreate(payload: {
    title: string;
    slug?: string;
    content: string;
    imageUrl?: string;
    status?: BlogPostStatus;
  }) {
    const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
    const clash = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (clash) throw new BadRequestException('Slug already in use');
    return this.prisma.blogPost.create({
      data: {
        title: payload.title,
        slug,
        content: payload.content,
        imageUrl: payload.imageUrl,
        status: (payload.status ?? BlogPostStatus.DRAFT) as any,
      },
    });
  }

  async adminUpdate(
    id: string,
    payload: Partial<{ title: string; slug: string; content: string; imageUrl: string; status: BlogPostStatus }>,
  ) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const data: any = {};
    if (payload.title != null) data.title = payload.title;
    if (payload.content != null) data.content = payload.content;
    if (payload.imageUrl !== undefined) data.imageUrl = payload.imageUrl;
    if (payload.status != null) data.status = payload.status as any;
    if (payload.slug != null) {
      const slug = slugify(payload.slug);
      const clash = await this.prisma.blogPost.findUnique({ where: { slug } });
      if (clash && clash.id !== post.id) throw new BadRequestException('Slug already in use');
      data.slug = slug;
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async adminDelete(id: string) {
    await this.prisma.blogPost.deleteMany({ where: { id } });
    return { ok: true };
  }
}
