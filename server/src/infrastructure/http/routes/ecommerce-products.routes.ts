import { Router } from 'express';
import { ProductSearchController } from '@infrastructure/http/controllers/ecommerce/ProductSearchController';
import { ProductBestSellersController } from '@infrastructure/http/controllers/ecommerce/ProductBestSellersController';
import { ProductOnSaleController } from '@infrastructure/http/controllers/ecommerce/ProductOnSaleController';

const router = Router();
const searchController = new ProductSearchController();
const bestSellersController = new ProductBestSellersController();
const onSaleController = new ProductOnSaleController();

// Rutas Públicas E-commerce
router.get('/ecommerce/products/search', searchController.search.bind(searchController));
router.get('/ecommerce/products/best-sellers', bestSellersController.getBestSellers.bind(bestSellersController));
router.get('/ecommerce/products/on-sale', onSaleController.getOnSale.bind(onSaleController));

// GET /api/v1/ecommerce/products/:slug — Detalle de un producto por slug (Público de e-commerce)
router.get('/ecommerce/products/:slug', searchController.getDetail.bind(searchController));

export default router;
