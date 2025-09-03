import { Service } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const providerRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Authentication token not found.");
    
    const authHeader = { 'Authorization': `Bearer ${token}` };
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
        if (response.status === 204) return {} as T;
        return response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

export const getMyServices = (): Promise<Service[]> => {
    return providerRequest<Service[]>('services/my-services');
};

export const getServiceForEdit = (serviceId: string): Promise<Service> => {
    return providerRequest<Service>(`services/provider/${serviceId}`);
};

export const updateService = ({ serviceId, serviceData }: { serviceId: string, serviceData: FormData }): Promise<Service> => {
    return providerRequest<Service>(`services/${serviceId}`, {
        method: 'PATCH',
        body: serviceData,
    });
};

export const deleteService = (serviceId: string): Promise<void> => {
    return providerRequest<void>(`services/${serviceId}`, {
        method: 'DELETE',
    });
};