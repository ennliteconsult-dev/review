import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Role } from '@/types';

interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: Omit<User, 'id'>) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((newToken: string, userData: any) => {
        const fullUser: User = {
            id: userData.userId,
            name: userData.name,
            email: userData.email,
            role: userData.role
        };
        setToken(newToken);
        setUser(fullUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(fullUser));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const value = {
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};