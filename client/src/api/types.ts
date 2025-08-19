// Shared DTOs aligned with server API

export type Role = 'user' | 'admin';

export type AuthLoginBody = { email: string; password: string };
export type AuthRegisterBody = { email: string; password: string };
export type AuthLoginResponse = { access: string };
export type AuthRefreshResponse = { access: string };

export type ServiceDTO = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  published: boolean;
};

export type StaffDTO = {
  id: number;
  name: string;
  role?: string;
  bio?: string;
  photoUrl?: string;
  active: boolean;
};

export type UserMeDTO = {
  id: number;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
};

export type AdminUserDTO = {
  id: number;
  email: string;
  role: Role;
  active: boolean;
  createdAt?: string;
};
