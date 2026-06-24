import { Router } from 'express';
import { ProductSearchController } from '@infrastructure/http/controllers/ecommerce/ProductSearchController';

const router = Router();
const controller = new ProductSearchController();

// GET /api/v1/ecommerce/products/search — Búsqueda predictiva y filtros avanzados (Público de e-commerce)
router.get('/ecommerce/products/search', controller.search.bind(controller));

export default router;
