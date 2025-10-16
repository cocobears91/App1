import { request } from './client';
import { AuthResponse } from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = (payload: LoginPayload): Promise<AuthResponse> =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
