import { BrandConfig } from '@domain/entities/BrandConfig';

export interface IBrandConfigRepository {
  find(): Promise<BrandConfig | null>;
  upsert(data: {
    brandName: string;
    logoUrl?: string | null;
    primaryColor: string;
    socialLinksJson?: any;
  }): Promise<BrandConfig>;
}
