import { Router } from 'express';
import { protect, checkRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';
import { getAllServicesForAdmin, approveService, rejectService, getAllUsers, promoteUserToAdmin, toggleFeaturedStatus, getServiceByIdForAdmin, deleteServiceByAdmin, deleteUserByAdmin } from '../controllers/adminController';

const router = Router();

// All routes in this file are protected and for admins only
router.use(protect, checkRole([Role.ADMIN]));

router.get('/services', getAllServicesForAdmin);
router.patch('/services/:id/approve', approveService);
router.patch('/services/:id/reject', rejectService);
router.delete('/services/:id', deleteServiceByAdmin); 

router.get('/users', getAllUsers);
router.patch('/users/:id/promote', promoteUserToAdmin);
router.patch('/services/:id/feature', toggleFeaturedStatus);
router.get('/services/:id', getServiceByIdForAdmin);
router.delete('/users/:id', deleteUserByAdmin); 

export default router;