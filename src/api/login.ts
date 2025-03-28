import type { AuthenticationResponse } from '@/types/auth.js'
import axios from 'axios';

export async function login(username: string, password: string) {
  return axios.post<{ result: AuthenticationResponse }>("http://localhost:8080/auth/token", { username, password });
}
