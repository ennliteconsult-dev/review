import { CreateReviewData, Review } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const reviewRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    if (!token) throw new Error("You must be logged in to perform this action.");
    
    const authHeader = { 'Authorization': `Bearer ${token}` };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeader,
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }
        return response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

export const createReview = ({ serviceId, reviewData }: { serviceId: string, reviewData: CreateReviewData }): Promise<Review> => {
    return reviewRequest<Review>(`services/${serviceId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
    });
};