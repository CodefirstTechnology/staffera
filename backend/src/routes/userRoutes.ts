import { Router } from 'express';
import { 
  getMyAddresses, 
  createAddress, 
  getWalletData, 
  addMoneyToWallet, 
  getSubscriptionPlans, 
  purchaseSubscription 
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure all user profiles, wallet operations, and sub packages
router.use(authenticate);

// Addresses routes
router.get('/addresses', getMyAddresses);
router.post('/addresses', createAddress);

// Wallet routes
router.get('/wallet', getWalletData);
router.post('/wallet/add-money', addMoneyToWallet);

// Subscription routes
router.get('/subscriptions/plans', getSubscriptionPlans);
router.post('/subscriptions/purchase', purchaseSubscription);

export default router;
