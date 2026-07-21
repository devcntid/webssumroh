import type { AdminRole } from "@/types/db";

export interface SessionPayload {
  userId: number;
  role: AdminRole;
  email: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    role: AdminRole;
  };
}
