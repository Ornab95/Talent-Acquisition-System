export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  department?: string;
  profilePicture?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  profilePicture?: string;
}