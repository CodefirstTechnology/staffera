import { Router } from 'express';
import { registerMobile, verifyOtp, loginWithCredentials, refreshToken } from '../controllers/authController';

const router = Router();

router.post('/register-mobile', registerMobile);
router.post('/verify-otp', verifyOtp);
router.post('/login-credentials', loginWithCredentials);
router.post('/refresh-token', refreshToken);

export default router;
