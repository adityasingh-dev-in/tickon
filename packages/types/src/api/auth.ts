import { SafeUser } from '../models/user.model.js';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SafeUser;
  message?: string;
}
