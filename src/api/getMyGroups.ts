import axios from "axios";
import type { ApiResponse } from "@/types/api.js";
import type { ApiGroupResponse, Group } from '@/types/group.js'
import { get } from "./axiosInstance.js";

export async function fetchGetMyGroups(): Promise<Group[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    const res: ApiGroupResponse = await get(
      '/groups',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.result || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách nhóm');
  }
}
