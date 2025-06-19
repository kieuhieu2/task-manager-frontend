import type { AuthenticationResponse } from '@/types/auth.js'
import axios from 'axios';
import axiosInstance from './axiosInstance.js';

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

export async function requestPasswordReset() {
  try {
    const userCode = localStorage.getItem('userCode');
    const res = await axiosInstance.post(
      '/auth/password-reset-request',
      { userCode },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    return res.data.result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
    }
    throw new Error('Không thể gửi yêu cầu đặt lại mật khẩu');
  }
}

export async function changePassword(oldPassword: string, otpCode: string, newPassword: string) {
  try {
    const userCode = localStorage.getItem('userCode');
    const res = await axiosInstance.post(
      '/auth/password-change',
      { userCode, oldPassword, otpCode, newPassword },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    return res.data.result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Không thể thay đổi mật khẩu');
    }
    throw new Error('Không thể thay đổi mật khẩu');
  }
}


