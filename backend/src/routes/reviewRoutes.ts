import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { createReview, getReviewsForService } from '../controllers/reviewController';

// Note: This router will be mounted under a path like /api/services/:serviceId
// So the routes here will be relative to that.
const router = Router({ mergeParams: true });

router.route('/')
    .get(getReviewsForService)
    .post(protect, createReview);

export default router;