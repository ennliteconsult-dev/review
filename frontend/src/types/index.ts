export enum Role {
    USER = 'USER',
    PROVIDER = 'PROVIDER',
    ADMIN = 'ADMIN'
}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    authorId: string;
    author: {
        name: string;
    };
    createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  location?: string;
  providerName: string;
  providerId: string; // Add providerId to check if current user is the owner
  image?: string;
  featured?: boolean;
  approvalStatus: ApprovalStatus;
  reviews?: Review[];
}

export interface TopService extends Service {
  rank: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

// Types for API requests
export type RegisterCredentials = Omit<User, 'id'> & { password?: string };
export type LoginCredentials = Pick<RegisterCredentials, 'email' | 'password'>;
export type CreateServiceData = Pick<Service, 'name' | 'description' | 'category' | 'location'>;
export type CreateReviewData = Pick<Review, 'rating' | 'comment'>;

// Types for API responses
export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface UserResponse {
  message: string;
  user: Omit<User, 'password'>;
}