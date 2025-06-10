import axiosInstance from './axiosInstance.js';
import type { User } from '@/types/user.js'

export async function createUser(formData: FormData): Promise<User> {
  try {
    const res = await axiosInstance.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể tạo người dùng');
  }
}

export async function getMyInfo(): Promise<User> {
  try {
    const res = await axiosInstance.get('/users/my-info', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
}

export async function updateMyInfo(formData: FormData): Promise<User> {
  const userCode = localStorage.getItem('userCode');
  try {
    const res = await axiosInstance.put(`/users/${userCode}`, formData,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
}

export async function getFullNameByUserCode(userCode: String): Promise<string> {
  try {
    const res = await axiosInstance.get(`/users/find-full-name/${userCode}`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
}



