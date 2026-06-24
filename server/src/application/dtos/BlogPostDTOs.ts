import { PostStatus } from '@domain/entities/BlogPost';

export interface CreateBlogPostRequestDTO {
  title: string;
  content: string;
  status?: PostStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateBlogPostRequestDTO {
  title?: string;
  content?: string;
  status?: PostStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface BlogPostResponseDTO {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    name: string;
  };
}
