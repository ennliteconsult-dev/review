import { Service, TopService, CreateServiceData } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const defaultHeaders: HeadersInit = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
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

export const getServices = (category?: string): Promise<Service[]> => {
    const endpoint = category && category !== 'All' 
        ? `services?category=${encodeURIComponent(category)}` 
        : 'services';
    return apiRequest<Service[]>(endpoint);
};

export const getServiceById = (id: string): Promise<Service> => {
    return apiRequest<Service>(`services/${id}`);
};

export const getFeaturedServices = (): Promise<Service[]> => {
    return apiRequest<Service[]>('services/featured');
}

export const getTopRankedServices = (): Promise<TopService[]> => {
    return apiRequest<Service[]>('services/top-ranked');
}

export const createService = (data: FormData): Promise<Service> => {
    return apiRequest<Service>('services', {
        method: 'POST',
        body: data,
    });
};

export const searchServices = (query: string): Promise<Service[]> => {
    return apiRequest<Service[]>(`services/search?q=${encodeURIComponent(query)}`);
};