import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getUserProfile } from '../controllers/userController';

const router = Router();

router.get('/profile', protect, getUserProfile);

export default router;