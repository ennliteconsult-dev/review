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
      name:string;
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
providerId: string;
providerPhone?: string | null;
videoUrl?: string; 
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
phone?: string;
createdAt: string;
}

// --- REVISED AND EXPLICIT TYPES ---

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  category: string;
  location: string;
  videoUrl?: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

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
user: User;
}