import { Service, User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const adminRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}/admin/${endpoint}`;
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Authentication token not found.");
    
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

        // --- THIS IS THE FIX ---
        // A 204 status means success, but there is no JSON body to parse.
        // We return an empty object to resolve the promise successfully.
        if (response.status === 204) {
            return {} as T;
        }

        // Only attempt to parse JSON if there is content.
        return response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

export const getAllServicesForAdmin = (): Promise<Service[]> => {
    return adminRequest<Service[]>('services');
};

export const approveService = (serviceId: string): Promise<Service> => {
    return adminRequest<Service>(`services/${serviceId}/approve`, { method: 'PATCH' });
};

export const rejectService = (serviceId: string): Promise<Service> => {
    return adminRequest<Service>(`services/${serviceId}/reject`, { method: 'PATCH' });
};

export const setFeaturedStatus = ({ serviceId, featured }: { serviceId: string; featured: boolean }): Promise<Service> => {
    return adminRequest<Service>(`services/${serviceId}/feature`, {
        method: 'PATCH',
        body: JSON.stringify({ featured }),
    });
};

export const getAdminServiceById = (serviceId: string): Promise<Service> => {
    return adminRequest<Service>(`services/${serviceId}`);
};

export const deleteService = (serviceId: string): Promise<void> => {
    return adminRequest<void>(`services/${serviceId}`, { method: 'DELETE' });
};

export const getUsers = (): Promise<User[]> => {
    return adminRequest<User[]>('users');
};

export const promoteUser = (userId: string): Promise<User> => {
    return adminRequest<User>(`users/${userId}/promote`, { method: 'PATCH' });
};

export const deleteUser = (userId: string): Promise<void> => {
    return adminRequest<void>(`users/${userId}`, { method: 'DELETE' });
};