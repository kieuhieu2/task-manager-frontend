import axiosInstance from './axiosInstance.js';
import type { User } from '@/types/user.js'

interface UserResponse {
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  code: string;
  dob: string | null;
  roles: Array<{
    name: string;
    description: string;
    permissions: string[];
  }>;
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export async function createUser(formData: FormData): Promise<User> {
  try {
    const res = await axiosInstance.post('/users', formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể tạo người dùng');
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

  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể cập nhập thông tin người dùng');
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
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
}

export async function getUsersByPage(page: number = 0, size: number = 10): Promise<PaginatedResponse<UserResponse>> {
  try {
    const res = await axiosInstance.get(`/users`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
}

export async function getUserByCode(userCode: string): Promise<UserResponse> {
  try {
    const res = await axiosInstance.get(`/users/${userCode}`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
}

export async function deleteUser(userCode: string): Promise<UserResponse> {
  try {
    const res = await axiosInstance.delete(`/users/${userCode}`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
  }
}

export async function getMyAvatar(userCode: string): Promise<string> {
  try {

    //call to mcok data /users/my-avatar
    const res = await axiosInstance.get(`/users/my-avatar`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result.avatar;

  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy ảnh đại diện người dùng');
  }
}



