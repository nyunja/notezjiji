import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getUserPurchases,
  getDownloadUrl,
  getUploaderEarnings,
  requestPayout,
  getPayoutHistory
} from '../controllers/paymentController.js';

const router = Router();

router.post('/initialize', authenticateToken, paymentLimiter, initializePayment);
router.get('/verify/:reference', authenticateToken, verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/purchases', authenticateToken, getUserPurchases);
router.get('/download/:itemId', authenticateToken, getDownloadUrl);
router.get('/earnings', authenticateToken, getUploaderEarnings);
router.post('/payout', authenticateToken, requestPayout);
router.get('/payouts', authenticateToken, getPayoutHistory);

export default router;
