import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// POST /api/services/:serviceId/reviews
export const createReview = async (req: AuthRequest, res: Response) => {
    const { serviceId } = req.params;
    const { rating, comment } = req.body;
    const authorId = req.userId;

    if (!authorId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required' });
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    try {
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (service.providerId === authorId) {
            return res.status(403).json({ message: 'You cannot review your own service' });
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                authorId,
                serviceId,
            }
        });

        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this service' });
        }

        // Use a transaction to create the review and update the service's aggregate rating
        const transactionResult = await prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    rating,
                    comment,
                    authorId,
                    serviceId,
                },
            });

            // Recalculate the service's average rating and review count
            const aggregate = await tx.review.aggregate({
                where: { serviceId },
                _avg: { rating: true },
                _count: { id: true },
            });

            const averageRating = aggregate._avg.rating || 0;
            // Round the average rating to one decimal place
            const roundedRating = Math.round(averageRating * 10) / 10;

            await tx.service.update({
                where: { id: serviceId },
                data: {
                    rating: roundedRating,
                    reviewCount: aggregate._count.id,
                },
            });

            return newReview;
        });
        
        res.status(201).json(transactionResult);
    } catch (error) {
        console.error(`Failed to create review for service ${serviceId}:`, error);
        res.status(500).json({ message: 'Failed to create review' });
    }
};

// GET /api/services/:serviceId/reviews
export const getReviewsForService = async (req: AuthRequest, res: Response) => {
    const { serviceId } = req.params;

    try {
        const reviews = await prisma.review.findMany({
            where: { serviceId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json(reviews);
    } catch (error) {
        console.error(`Failed to get reviews for service ${serviceId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve reviews' });
    }
};