import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apiVersion': 'v1.0',
  },
});

export const post = async <T>(path: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await httpRequest.post(path, data, options);
  return response.data;
};

export const get = async <T>(path: string, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await httpRequest.get(path, options);
  return response.data;
};

export const put = async <T>(path: string, data: unknown, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await httpRequest.put(path, data, options);
  return response.data;
};

export const deleteRequest = async <T>(path: string, options: AxiosRequestConfig = {}): Promise<T> => {
  const response: AxiosResponse<T> = await httpRequest.delete(path, options);
  return response.data;
};

export default httpRequest;
