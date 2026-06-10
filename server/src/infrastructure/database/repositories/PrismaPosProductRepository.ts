import prisma from '@infrastructure/database/prisma';
import { IPosProductRepository, PosProductResult } from '@domain/repositories/IPosProductRepository';

export class PrismaPosProductRepository implements IPosProductRepository {
  async searchProducts(query: string, branchId: number): Promise<PosProductResult[]> {
    // 1. Buscar todas las variantes activas de productos activos que coincidan por SKU o por nombre de producto
    const records = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        product: {
          isActive: true,
        },
        OR: [
          {
            sku: {
              contains: query,
            },
          },
          {
            product: {
              name: {
                contains: query,
              },
            },
          },
        ],
      },
      include: {
        product: true,
        branchStock: {
          where: {
            branchId: branchId,
          },
        },
      },
    });

    // 2. Mapear al resultado esperado
    return records.map((record) => {
      const branchStockRecord = record.branchStock[0];
      const stock = branchStockRecord ? branchStockRecord.quantity : 0;

      // Generar un nombre descriptivo concatenando atributos si existen
      let fullName = record.product.name;
      const attributes = record.attributesJson as any;
      if (attributes && typeof attributes === 'object') {
        const parts = Object.entries(attributes)
          .map(([_, val]) => String(val))
          .join(' - ');
        if (parts) {
          fullName += ` - ${parts}`;
        }
      }

      return {
        variantId: record.id,
        productId: record.productId,
        sku: record.sku,
        name: fullName,
        baseName: record.product.name,
        price: Number(record.price),
        stock: stock,
        attributes: attributes || {},
      };
    });
  }
}
