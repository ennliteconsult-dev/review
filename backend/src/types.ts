export interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    rating: number;
    reviewCount: number;
    location?: string;
    providerName: string;
    image?: string;
    featured?: boolean;
}

export interface TopService {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    rank: number;
}