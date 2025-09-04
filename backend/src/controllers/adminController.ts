import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ApprovalStatus } from '@prisma/client';

// --- FIX #1: Add 'phone' to the provider select ---
const includeProvider = {
    provider: {
        select: {
            name: true,
            phone: true, // Added phone
        },
    },
};

// --- FIX #2: Add 'providerPhone' to the transformed object ---
const transformService = (service: any) => {
    const { provider, ...rest } = service;
    return {
        ...rest,
        providerName: provider.name,
        providerPhone: provider?.phone || null, // Added providerPhone
    };
};

export const deleteServiceByAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // First, delete all reviews associated with the service to maintain data integrity
        await prisma.review.deleteMany({
            where: { serviceId: id },
        });

        // Then, delete the service itself
        await prisma.service.delete({
            where: { id },
        });

        res.status(204).send(); // Send a 'No Content' response for a successful deletion
    } catch (error) {
        console.error(`Admin failed to delete service ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete service' });
    }
};

// --- NEW FUNCTION: DELETE /api/admin/users/:id ---
export const deleteUserByAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // A user might be a provider with services. We need to handle this.
        // Step 1: Find all services provided by this user.
        const userServices = await prisma.service.findMany({
            where: { providerId: id },
            select: { id: true },
        });
        const serviceIds = userServices.map(service => service.id);

        // Step 2: Delete all reviews for those services.
        if (serviceIds.length > 0) {
            await prisma.review.deleteMany({
                where: { serviceId: { in: serviceIds } },
            });
        }
        
        // Step 3: Delete the services themselves.
        await prisma.service.deleteMany({
            where: { providerId: id },
        });

        // Step 4: Delete all reviews written by this user.
        await prisma.review.deleteMany({
            where: { authorId: id },
        });

        // Step 5: Finally, delete the user.
        await prisma.user.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error(`Admin failed to delete user ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};


// GET /api/admin/services
export const getAllServicesForAdmin = async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            include: includeProvider,
            orderBy: { createdAt: 'desc' },
        });
        res.json(services.map(transformService));
    } catch (error) {
        console.error('Admin failed to get services:', error);
        res.status(500).json({ message: 'Failed to retrieve services' });
    }
};

// PATCH /api/admin/services/:id/feature
export const toggleFeaturedStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
        return res.status(400).json({ message: 'Featured status must be a boolean' });
    }

    try {
        const updatedService = await prisma.service.update({
            where: { id },
            data: { featured },
        });
        res.json(updatedService);
    } catch (error) {
        console.error(`Admin failed to update featured status for service ${id}:`, error);
        res.status(500).json({ message: 'Failed to update service' });
    }
};

// GET /api/admin/services/:id
export const getServiceByIdForAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                ...includeProvider, // This now correctly includes the phone number
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        // This now correctly transforms the service object with the phone number
        res.json(transformService(service));
    } catch (error) {
        console.error(`Admin failed to get service ${id}:`, error);
        res.status(500).json({ message: "Failed to retrieve service" });
    }
};

// PATCH /api/admin/services/:id/approve
export const approveService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedService = await prisma.service.update({
            where: { id },
            data: { approvalStatus: ApprovalStatus.APPROVED },
        });
        res.json(updatedService);
    } catch (error) {
        console.error(`Admin failed to approve service ${id}:`, error);
        res.status(500).json({ message: 'Failed to approve service' });
    }
};

// PATCH /api/admin/services/:id/reject
export const rejectService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedService = await prisma.service.update({
            where: { id },
            data: { approvalStatus: ApprovalStatus.REJECTED },
        });
        res.json(updatedService);
    } catch (error) {
        console.error(`Admin failed to reject service ${id}:`, error);
        res.status(500).json({ message: 'Failed to reject service' });
    }
};

// GET /api/admin/users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        console.error('Admin failed to get users:', error);
        res.status(500).json({ message: 'Failed to retrieve users' });
    }
};

// PATCH /api/admin/users/:id/promote
export const promoteUserToAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role: 'ADMIN' },
        });
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(`Admin failed to promote user ${id}:`, error);
        res.status(500).json({ message: 'Failed to promote user' });
    }
};