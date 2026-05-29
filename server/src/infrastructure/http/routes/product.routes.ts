import { Router } from 'express';
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
