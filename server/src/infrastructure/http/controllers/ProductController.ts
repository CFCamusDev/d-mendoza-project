import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaProductRepository } from '@infrastructure/database/repositories/PrismaProductVariantRepository';
import { GetActiveProductsUseCase } from '@application/use-cases/product/GetActiveProductsUseCase';
import { ToggleProductStatusUseCase } from '@application/use-cases/product/ToggleProductStatusUseCase';

const productRepository = new PrismaProductRepository();
const getActiveProductsUseCase = new GetActiveProductsUseCase(productRepository);
const toggleProductStatusUseCase = new ToggleProductStatusUseCase(productRepository);

const ToggleStatusSchema = z.object({
  isActive: z.boolean(),
});

export class ProductController {
  /**
   * GET /api/v1/ecommerce/products
   * Listar todos los productos activos para e-commerce público
   */
  async getActiveProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await getActiveProductsUseCase.execute();
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/products/:id/status
   * Inactivación / activación lógica de un producto (Restringido a ADMIN)
   */
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de producto inválido' });
      }

      const validation = ToggleStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          errors: validation.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const updatedProduct = await toggleProductStatusUseCase.execute(id, validation.data.isActive);
      return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error: any) {
      if (error.message.includes('no existe')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
