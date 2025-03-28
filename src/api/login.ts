import { post } from "./axiosInstance.js";
import type { AuthenticationResponse } from '@/types/auth.js'

export async function login(username: string, password: string) {
  return post<{ result: AuthenticationResponse }>("/auth/token", { username, password });
}
