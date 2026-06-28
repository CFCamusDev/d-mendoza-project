import prisma from '@infrastructure/database/prisma';
import { Product, CreateProductDTO } from '@domain/entities/Product';
import { IProductRepository } from '@domain/repositories/IProductVariantRepository';

export class PrismaProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    return prisma.product.findMany({
      include: { images: true, category: true, brand: true, variants: true },
      orderBy: { name: 'asc' },
    }) as unknown as Promise<Product[]>;
  }

  async findAllActive(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { images: true, category: true, brand: true, variants: true },
      orderBy: { name: 'asc' },
    }) as unknown as Promise<Product[]>;
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true, brand: true, variants: true },
    }) as unknown as Promise<Product | null>;
  }

  async findByCode(code: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { code },
      include: { images: true, category: true, brand: true, variants: true },
    }) as unknown as Promise<Product | null>;
  }

  async create(data: CreateProductDTO | { code: string; name: string; description?: string }): Promise<Product> {
    const fullData = data as CreateProductDTO;
    const generatedSlug = fullData.slug || 
      (fullData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + fullData.code.toLowerCase());

    return prisma.product.create({
      data: {
        code: fullData.code,
        name: fullData.name,
        slug: generatedSlug,
        description: fullData.description ?? null,
        model: fullData.model ?? null,
        categoryId: fullData.categoryId ?? null,
        brandId: fullData.brandId ?? null,
        gender: fullData.gender ?? null,
      },
      include: { images: true, variants: true },
    }) as unknown as Promise<Product>;
  }

  async update(id: number, data: Partial<CreateProductDTO & { isActive: boolean }>): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: { images: true, variants: true },
    }) as unknown as Promise<Product>;
  }

  async updateStatus(id: number, isActive: boolean): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { isActive },
      include: { images: true, variants: true },
    }) as unknown as Promise<Product>;
  }

  async addImage(productId: number, url: string, isMain: boolean): Promise<void> {
    if (isMain) {
      await prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } });
    }
    await prisma.productImage.create({ data: { productId, url, isMain } });
  }

  async countMainImages(productId: number): Promise<number> {
    return prisma.productImage.count({ where: { productId, isMain: true } });
  }

  async deleteImage(productId: number, imageId: number): Promise<void> {
    await prisma.productImage.delete({
      where: {
        id: imageId,
        productId,
      },
    });
  }
}
