import { LoginCredentials, RegisterCredentials, AuthResponse, UserResponse } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

const authRequest = async <T>(endpoint: string, body: any): Promise<T> => {
    const url = `${API_BASE_URL}/auth/${endpoint}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

export const registerUser = (credentials: RegisterCredentials): Promise<UserResponse> => {
    return authRequest<UserResponse>('register', credentials);
};

export const loginUser = (credentials: LoginCredentials): Promise<AuthResponse> => {
    return authRequest<AuthResponse>('login', credentials);
};