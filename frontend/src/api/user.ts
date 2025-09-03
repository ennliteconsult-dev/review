import { User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const userRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}/users/${endpoint}`;
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
        return response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

export const getProfile = (): Promise<User> => {
    return userRequest<User>('profile');
};