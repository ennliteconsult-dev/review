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

const router = Router();

// Mount review router on /:serviceId/reviews
router.use('/:serviceId/reviews', reviewRoutes);

router.route('/')
    .get(getAllServices)
    // Remove upload.single('image') - we are now accepting JSON data
    .post(protect, checkRole([Role.PROVIDER, Role.ADMIN]), createService);

router.get('/my-services', protect, checkRole([Role.PROVIDER]), getMyServices);
router.get('/featured', getFeaturedServices);
router.get('/top-ranked', getTopRankedServices);
router.get('/search', searchServices);
router.get('/provider/:id', protect, checkRole([Role.PROVIDER]), getProviderServiceById);

router.route('/:id')
    .get(getServiceById)
    // Remove upload.single('image')
    .patch(protect, checkRole([Role.PROVIDER, Role.ADMIN]), updateService)
    .delete(protect, checkRole([Role.PROVIDER, Role.ADMIN]), deleteService);

export default router;