import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadProductImages } from '../middleware/upload';
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, deleteProductImage,
} from '../controllers/product.controller';

const router = Router();

router.get('/',                     getProducts);
router.get('/:id',                  getProduct);
router.post('/',    requireAuth, (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) { res.status(400).json({ error: (err as Error).message }); return; }
    next();
  });
}, createProduct);
router.put('/:id',  requireAuth, (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) { res.status(400).json({ error: (err as Error).message }); return; }
    next();
  });
}, updateProduct);
router.delete('/:id',               requireAuth, deleteProduct);
router.delete('/:id/images/:imgId', requireAuth, deleteProductImage);

export default router;
