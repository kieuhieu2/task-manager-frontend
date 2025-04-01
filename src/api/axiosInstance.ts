import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apiVersion': 'v1.0',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const post = async <T>(path: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.post(path, data, options);
  return response.data;
};

export const get = async <T>(path: string, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.get(path, options);
  return response.data;
};

export const put = async <T>(path: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.put(path, data, options);
  return response.data;
};

export const deleteRequest = async <T>(path: string, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.delete(path, options);
  return response.data;
};

export default axiosInstance;
