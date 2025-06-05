import axiosInstance from './axiosInstance.js';

export async function createUser(formData: FormData): Promise<any> {
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
