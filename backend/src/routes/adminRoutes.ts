import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getDashboardStats,
  getPendingItems,
  approveItem,
  rejectItem,
  getAllUsers,
  updateUserRole,
  unlockUserAccount,
  getPendingPayouts,
  approvePayout,
  rejectPayout,
  getAuditLogs
} from '../controllers/adminController.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);

router.get('/items/pending', getPendingItems);
router.post('/items/:itemId/approve', approveItem);
router.post('/items/:itemId/reject', rejectItem);

router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.post('/users/:userId/unlock', unlockUserAccount);

router.get('/payouts/pending', getPendingPayouts);
router.post('/payouts/:payoutId/approve', approvePayout);
router.post('/payouts/:payoutId/reject', rejectPayout);

router.get('/audit-logs', getAuditLogs);

export default router;
