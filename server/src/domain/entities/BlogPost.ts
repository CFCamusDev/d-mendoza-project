export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface BlogPost {
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
}
