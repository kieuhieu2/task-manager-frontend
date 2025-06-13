import { post } from '@/api/axiosInstance.js';
import type { ApiResponse } from '@/types/api.ts'

export const createUser = async (userData: {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;
}) => {
  try {
    const response: ApiResponse = await post('/users', userData);

    if (response.code === 1000) {
      return response.result;
    } else {
      return response;
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    throw error;
  }
};
