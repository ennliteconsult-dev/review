import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ApprovalStatus } from '@prisma/client';

const includeProvider = {
    provider: {
        select: {
            name: true,
        },
    },
};

const transformService = (service: any) => {
    const { provider, ...rest } = service;
    return {
        ...rest,
        providerName: provider.name,
    };
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
    const { featured } = req.body; // Expecting { featured: true } or { featured: false }

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
                ...includeProvider,
                reviews: { // You might want to see reviews even if pending
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
        // Exclude password from the returned object
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(`Admin failed to promote user ${id}:`, error);
        res.status(500).json({ message: 'Failed to promote user' });
    }
};