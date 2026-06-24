export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  views?: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
  };
}
