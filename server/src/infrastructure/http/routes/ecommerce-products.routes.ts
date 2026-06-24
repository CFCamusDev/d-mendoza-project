import { Router } from 'express';
import { ProductSearchController } from '@infrastructure/http/controllers/ecommerce/ProductSearchController';

const router = Router();
const controller = new ProductSearchController();

// GET /api/v1/ecommerce/products/search — Búsqueda predictiva y filtros avanzados (Público de e-commerce)
router.get('/ecommerce/products/search', controller.search.bind(controller));

// GET /api/v1/ecommerce/products/:slug — Detalle de un producto por slug (Público de e-commerce)
router.get('/ecommerce/products/:slug', controller.getDetail.bind(controller));

export default router;
