import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { TopService } from '../types';
import { AuthRequest } from '../middleware/authMiddleware';

const includeProvider = {
    provider: {
        select: {
            name: true,
            phone: true,
        },
    },
};

// Helper to transform service data
const transformService = (service: any) => {
    const { provider, reviews, ...rest } = service;
    const result: any = {
        ...rest,
        providerName: provider?.name || 'N/A',
        providerPhone: provider?.phone || null,
    };
    if (reviews !== undefined) {
        result.reviews = reviews;
    }
    return result;
};


// GET /api/services
export const getAllServices = async (req: Request, res: Response) => {
    const { category } = req.query;
    let whereClause: any = { approvalStatus: 'APPROVED' };
    if (category && typeof category === 'string' && category !== 'All') {
        whereClause.category = { equals: category };
    }
    try {
        const services = await prisma.service.findMany({
            where: whereClause,
            include: includeProvider,
            orderBy: { createdAt: 'desc' }
        });
        res.json(services.map(transformService));
    } catch (error) {
        console.error("Failed to get services:", error);
        res.status(500).json({ message: "Failed to retrieve services" });
    }
};

// GET /api/services/featured
export const getFeaturedServices = async (req: Request, res: Response) => {
    try {
        const featured = await prisma.service.findMany({
            where: { 
                featured: true,
                approvalStatus: 'APPROVED'
            },
            include: includeProvider,
            orderBy: { rating: 'desc' }
        });
        res.json(featured.map(transformService));
    } catch (error) {
        console.error("Failed to get featured services:", error);
        res.status(500).json({ message: "Failed to retrieve featured services" });
    }
};

// GET /api/services/top-ranked
export const getTopRankedServices = async (req: Request, res: Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentReviewsAggregation = await prisma.review.groupBy({
            by: ['serviceId'],
            where: { createdAt: { gte: thirtyDaysAgo } },
            _avg: { rating: true },
            _count: { id: true },
        });
        const rankedServices = recentReviewsAggregation
            .map(agg => ({
                serviceId: agg.serviceId,
                score: (agg._avg.rating || 0) * agg._count.id,
                rating: agg._avg.rating || 0,
                reviewCount: agg._count.id,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
        const serviceIds = rankedServices.map(s => s.serviceId);
        const topServicesDetails = await prisma.service.findMany({
            where: {
                id: { in: serviceIds },
                approvalStatus: 'APPROVED'
            },
            include: includeProvider,
        });
        const result: TopService[] = rankedServices.map((ranked, index) => {
            const details = topServicesDetails.find(d => d.id === ranked.serviceId);
            return {
                ...transformService(details),
                id: details!.id, name: details!.name, description: details!.description,
                category: details!.category, location: details!.location, featured: details!.featured,
                approvalStatus: details!.approvalStatus, rating: ranked.rating,
                reviewCount: ranked.reviewCount, rank: index + 1,
            };
        });
        res.json(result);
    } catch (error) {
        console.error("Failed to get top ranked services:", error);
        res.status(500).json({ message: "Failed to retrieve top ranked services" });
    }
};

// POST /api/services
export const createService = async (req: AuthRequest, res: Response) => {
    // --- DEBUGGING STEP ---
    console.log("Received request to create service. Body:", req.body);

    const { name, description, category, location, videoUrl } = req.body;
    const providerId = req.userId;

    if (!providerId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!name || !description || !category) {
        console.error("Validation failed: Missing required fields.");
        return res.status(400).json({ message: 'Name, description, and category are required' });
    }
    
    try {
        console.log("Attempting to create service in database with providerId:", providerId);
        const newService = await prisma.service.create({
            data: {
                name,
                description,
                category,
                location,
                videoUrl,
                providerId,
                rating: 0,
                reviewCount: 0,
                featured: false,
                approvalStatus: 'PENDING',
            },
            include: includeProvider
        });
        console.log("Service created successfully:", newService.id);
        res.status(201).json(transformService(newService));
    } catch (error) {
        // This will now print the detailed Prisma error to your backend console
        console.error('Failed to create service in database:', error); 
        res.status(500).json({ message: 'Failed to create service' });
    }
};

// GET /api/services/my-services
export const getMyServices = async (req: AuthRequest, res: Response) => {
    const providerId = req.userId;
    if (!providerId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const myServices = await prisma.service.findMany({
            where: { providerId },
            include: includeProvider,
            orderBy: { createdAt: 'desc' }
        });
        res.json(myServices.map(transformService));
    } catch(error) {
        console.error('Failed to get my services:', error);
        res.status(500).json({ message: 'Failed to retrieve your services' });
    }
}

// GET /api/services/search
export const searchServices = async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "A search query 'q' is required." });
    }
    try {
        const services = await prisma.service.findMany({
            where: {
                approvalStatus: 'APPROVED',
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                    { category: { contains: q, mode: 'insensitive' } },
                ],
            },
            include: includeProvider,
            orderBy: { rating: 'desc' }
        });
        res.json(services.map(transformService));
    } catch (error) {
        console.error("Failed to search services:", error);
        res.status(500).json({ message: "Failed to search services" });
    }
};

// PATCH /api/services/:id
export const updateService = async (req: AuthRequest, res: Response) => {
    const { id: serviceId } = req.params;
    // Destructure videoUrl from body
    const { name, description, category, location, videoUrl } = req.body;
    const providerId = req.userId;

    if (!providerId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (service.providerId !== providerId) {
            return res.status(403).json({ message: 'You are not authorized to edit this service' });
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                name, description, category, location,
                videoUrl, // Update the video URL
                approvalStatus: 'PENDING',
            },
            include: includeProvider,
        });

        res.json(transformService(updatedService));
    } catch (error) {
        console.error(`Failed to update service ${serviceId}:`, error);
        res.status(500).json({ message: 'Failed to update service' });
    }
};

// DELETE /api/services/:id
export const deleteService = async (req: AuthRequest, res: Response) => {
    const { id: serviceId } = req.params;
    const providerId = req.userId;
    if (!providerId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (service.providerId !== providerId) {
            return res.status(403).json({ message: 'You are not authorized to delete this service' });
        }
        await prisma.review.deleteMany({ where: { serviceId } });
        await prisma.service.delete({ where: { id: serviceId } });
        res.status(204).send();
    } catch (error) {
        console.error(`Failed to delete service ${serviceId}:`, error);
        res.status(500).json({ message: 'Failed to delete service' });
    }
};

// GET /api/services/provider/:id
export const getProviderServiceById = async (req: AuthRequest, res: Response) => {
    const { id: serviceId } = req.params;
    const providerId = req.userId;
    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: includeProvider,
        });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (service.providerId !== providerId) {
            return res.status(403).json({ message: 'You are not authorized to view this service' });
        }
        res.json(transformService(service));
    } catch (error) {
        console.error(`Failed to get provider service ${serviceId}:`, error);
        res.status(500).json({ message: "Failed to retrieve service" });
    }
};

// GET /api/services/:id
export const getServiceById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const service = await prisma.service.findUnique({
            where: { id },
            // --- THIS IS THE FIX ---
            // We now correctly include the provider's name AND phone
            include: {
                provider: {
                    select: {
                        name: true,
                        phone: true, // Add the phone field here
                    }
                },
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

        if (service && service.approvalStatus === 'APPROVED') {
            res.json(transformService(service));
        } else {
            res.status(404).json({ message: 'Service not found or is not approved' });
        }
    } catch (error) {
        console.error(`Failed to get service ${id}:`, error);
        res.status(500).json({ message: "Failed to retrieve service" });
    }
};