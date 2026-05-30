import prisma from '@infrastructure/database/prisma';
import { Product, CreateProductDTO } from '@domain/entities/Product';

export class PrismaProductRepository {
  async findAll(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { images: true, category: true, brand: true },
      orderBy: { name: 'asc' },
    }) as Promise<Product[]>;
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true, brand: true },
    }) as Promise<Product | null>;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    return prisma.product.create({
      data: {
        code: data.name.substring(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-4),
        name: data.name,
        description: data.description ?? null,
        categoryId: data.categoryId,
        brandId: data.brandId,
        gender: data.gender ?? null,
      },
      include: { images: true },
    }) as Promise<Product>;
  }

  async update(id: number, data: Partial<CreateProductDTO & { isActive: boolean }>): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: { images: true },
    }) as Promise<Product>;
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
}
