import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getOrders, getOrder, createOrder, updateOrderStatus } from '../controllers/order.controller';

const router = Router();

router.get('/',            requireAuth, getOrders);
router.get('/:id',         requireAuth, getOrder);
router.post('/',                        createOrder);
router.put('/:id/status',  requireAuth, updateOrderStatus);

export default router;
