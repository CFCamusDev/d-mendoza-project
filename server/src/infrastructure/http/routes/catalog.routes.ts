import { Router } from 'express';
import { CategoryController } from '@infrastructure/http/controllers/CategoryController';
import { ProductBrandController } from '@infrastructure/http/controllers/ProductBrandController';
import { requirePermission } from '@infrastructure/http/middlewares/auth.middleware';

const router = Router();
const categories = new CategoryController();
const brands = new ProductBrandController();

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', requirePermission('products:read'), categories.getAll.bind(categories));
router.get('/categories/:id', requirePermission('products:read'), categories.getOne.bind(categories));
router.post('/categories', requirePermission('products:write'), categories.create.bind(categories));
router.patch('/categories/:id', requirePermission('products:write'), categories.update.bind(categories));
router.delete('/categories/:id', requirePermission('products:write'), categories.deactivate.bind(categories));

// ─── Brands ───────────────────────────────────────────────────────────────────
router.get('/brands', requirePermission('products:read'), brands.getAll.bind(brands));
router.get('/brands/:id', requirePermission('products:read'), brands.getOne.bind(brands));
router.post('/brands', requirePermission('products:write'), brands.create.bind(brands));
router.patch('/brands/:id', requirePermission('products:write'), brands.update.bind(brands));
router.delete('/brands/:id', requirePermission('products:write'), brands.deactivate.bind(brands));

export default router;
