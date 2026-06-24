import { IBlogPostRepository } from '@domain/repositories/IBlogPostRepository';
import { BlogPost } from '@domain/entities/BlogPost';
import { CreateBlogPostRequestDTO, UpdateBlogPostRequestDTO } from '@application/dtos/BlogPostDTOs';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export class CreateBlogPostUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(dto: CreateBlogPostRequestDTO, authorId: number): Promise<BlogPost> {
    const baseSlug = generateSlug(dto.title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.blogPostRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.blogPostRepository.create({
      title: dto.title,
      slug,
      content: dto.content,
      status: dto.status ?? 'DRAFT',
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      authorId,
    });
  }
}

export class UpdateBlogPostUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(id: number, dto: UpdateBlogPostRequestDTO): Promise<BlogPost> {
    const existingPost = await this.blogPostRepository.findById(id);
    if (!existingPost) {
      throw new Error(`El artículo de blog con ID ${id} no existe`);
    }

    const updateData: Partial<{
      title: string;
      slug: string;
      content: string;
      status: 'DRAFT' | 'PUBLISHED';
      metaTitle: string | null;
      metaDescription: string | null;
    }> = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
      const baseSlug = generateSlug(dto.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const collisionPost = await this.blogPostRepository.findBySlug(slug);
        if (!collisionPost || collisionPost.id === id) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    if (dto.content !== undefined) {
      updateData.content = dto.content;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.metaTitle !== undefined) {
      updateData.metaTitle = dto.metaTitle;
    }

    if (dto.metaDescription !== undefined) {
      updateData.metaDescription = dto.metaDescription;
    }

    return this.blogPostRepository.update(id, updateData);
  }
}

export class GetBlogPostUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(id: number): Promise<BlogPost | null> {
    const post = await this.blogPostRepository.findById(id);
    if (!post) {
      throw new Error(`El artículo de blog con ID ${id} no existe`);
    }
    return post;
  }
}

export class ListBlogPostsUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(): Promise<BlogPost[]> {
    return this.blogPostRepository.findAll();
  }
}

export class DeleteBlogPostUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(id: number): Promise<void> {
    const existingPost = await this.blogPostRepository.findById(id);
    if (!existingPost) {
      throw new Error(`El artículo de blog con ID ${id} no existe`);
    }
    await this.blogPostRepository.delete(id);
  }
}

export class ListPublicBlogPostsUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(): Promise<BlogPost[]> {
    const all = await this.blogPostRepository.findAll();
    return all.filter(post => post.status === 'PUBLISHED');
  }
}

export class GetPublicBlogPostBySlugUseCase {
  constructor(private readonly blogPostRepository: IBlogPostRepository) {}

  async execute(slug: string): Promise<BlogPost | null> {
    const post = await this.blogPostRepository.findBySlug(slug);
    if (!post || post.status !== 'PUBLISHED') {
      return null;
    }
    return post;
  }
}
