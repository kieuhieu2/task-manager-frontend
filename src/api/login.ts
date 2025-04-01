import type { AuthenticationResponse } from '@/types/auth.js'
import axios from 'axios';

export async function login(username: string, password: string) {
  try {
    const response = await axios.post<{ result: AuthenticationResponse }>(
      "http://localhost:8080/auth/token",
      { username, password }
    );

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
