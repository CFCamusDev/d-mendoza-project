import { Router } from 'express';
import { ProductVariantController } from '@infrastructure/http/controllers/ProductVariantController';
import { ProductController } from '@infrastructure/http/controllers/ProductController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const productVariantController = new ProductVariantController();
const productController = new ProductController();

// ─────────────────────────────────────────────────────────────────────────────
// Rutas de Productos y Variantes — HU-014 / HU-015
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/ecommerce/products — Listar productos activos (Público de e-commerce)
router.get(
  '/ecommerce/products',
  productController.getActiveProducts.bind(productController)
);

// PATCH /api/v1/products/:id/status — Inactivación / activación lógica de un producto (Admin)
router.patch(
  '/products/:id/status',
  requirePermission('products:write'),
  productController.toggleStatus.bind(productController)
);

// GET /api/v1/products/:id/variants — Listar variantes de un producto
router.get(
  '/products/:id/variants',
  requirePermission('products:read'),
  productVariantController.getVariantsByProduct.bind(productVariantController)
);

// POST /api/v1/products/:id/variants — Generar variantes con SKU auto-generado
router.post(
  '/products/:id/variants',
  requirePermission('products:write'),
  productVariantController.createVariants.bind(productVariantController)
);

// PUT /api/v1/variants/:id — Editar precio y/o SKU de una variante individual
router.put(
  '/variants/:id',
  requirePermission('products:write'),
  productVariantController.updateVariant.bind(productVariantController)
import { ProductController, productUpload } from '@infrastructure/http/controllers/ProductController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const ctrl = new ProductController();

router.get('/products', requirePermission('products:read'), ctrl.getAll.bind(ctrl));
router.get('/products/:id', requirePermission('products:read'), ctrl.getOne.bind(ctrl));
router.post('/products', requirePermission('products:write'), ctrl.create.bind(ctrl));
router.patch('/products/:id', requirePermission('products:write'), ctrl.update.bind(ctrl));
router.post(
  '/products/:id/images',
  requirePermission('products:write'),
  productUpload.array('images', 10),
  ctrl.uploadImages.bind(ctrl)
);

export default router;
