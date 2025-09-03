import { Router } from 'express';
import {
    getAllServices,
    getFeaturedServices,
    getServiceById,
    getTopRankedServices,
    createService,
    getMyServices,
    searchServices,
    updateService,
    deleteService,
    getProviderServiceById,
} from '../controllers/serviceController';
import { protect, checkRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';
import reviewRoutes from './reviewRoutes';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Mount review router on /:serviceId/reviews
router.use('/:serviceId/reviews', reviewRoutes);

router.route('/')
    .get(getAllServices)
    .post(protect, checkRole([Role.PROVIDER, Role.ADMIN]), upload.single('image'), createService);

router.get('/my-services', protect, checkRole([Role.PROVIDER]), getMyServices);
router.get('/featured', getFeaturedServices);
router.get('/top-ranked', getTopRankedServices);
router.get('/search', searchServices);
router.get('/provider/:id', protect, checkRole([Role.PROVIDER]), getProviderServiceById);

router.route('/:id')
    .get(getServiceById)
    .patch(protect, checkRole([Role.PROVIDER, Role.ADMIN]), upload.single('image'), updateService)
    .delete(protect, checkRole([Role.PROVIDER, Role.ADMIN]), deleteService);

export default router;