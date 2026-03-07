import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getCategories, getCategoriesWithCount,
  createCategory, updateCategory, deleteCategory,
  addSubcategoria, removeSubcategoria,
} from '../controllers/category.controller';

const router = Router();

router.get('/',                                 getCategories);
router.get('/with-count',                       requireAuth, getCategoriesWithCount);
router.post('/',                                requireAuth, createCategory);
router.put('/:id',                              requireAuth, updateCategory);
router.delete('/:id',                           requireAuth, deleteCategory);
router.post('/:id/subcategorias',               requireAuth, addSubcategoria);
router.delete('/:id/subcategorias/:nombre',     requireAuth, removeSubcategoria);

export default router;
