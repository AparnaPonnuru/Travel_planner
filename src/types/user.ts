import { TravelStyle } from './trip';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  homeCity: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY';
  preferredTravelStyles: TravelStyle[];
  dietaryRestrictions: string[];
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}
