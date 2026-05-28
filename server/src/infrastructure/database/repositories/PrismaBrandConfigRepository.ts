import { IBrandConfigRepository } from '@domain/repositories/IBrandConfigRepository';
import { BrandConfig } from '@domain/entities/BrandConfig';
import prisma from '@infrastructure/database/prisma';

export class PrismaBrandConfigRepository implements IBrandConfigRepository {
  async find(): Promise<BrandConfig | null> {
    const config = await prisma.brandConfig.findUnique({
      where: { id: 1 },
    });
    if (!config) return null;

    return {
      id: config.id,
      brandName: config.brandName,
      logoUrl: config.logoUrl,
      primaryColor: config.primaryColor,
      socialLinksJson: (config.socialLinksJson as Record<string, string>) || {},
      updatedAt: config.updatedAt,
    };
  }

  async upsert(data: {
    brandName: string;
    logoUrl?: string | null;
    primaryColor: string;
    socialLinksJson?: any;
  }): Promise<BrandConfig> {
    const config = await prisma.brandConfig.upsert({
      where: { id: 1 },
      update: {
        brandName: data.brandName,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        socialLinksJson: data.socialLinksJson || {},
      },
      create: {
        id: 1,
        brandName: data.brandName,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        socialLinksJson: data.socialLinksJson || {},
      },
    });

    return {
      id: config.id,
      brandName: config.brandName,
      logoUrl: config.logoUrl,
      primaryColor: config.primaryColor,
      socialLinksJson: (config.socialLinksJson as Record<string, string>) || {},
      updatedAt: config.updatedAt,
    };
  }
}
