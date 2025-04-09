import type { ApiGroupResponse, Group } from '@/types/group.js'
import { post, get, put, deleteRequest } from "./axiosInstance.js";

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
    return res.result;

  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách nhóm');
  }

}

export async function updateGroup(group: Group): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    await put(
      `/groups`,
      group,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật nhóm');
  }
}

export async function deleteGroup(groupId: number): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    await deleteRequest(
      `/groups/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể xóa nhóm');
  }
}

export async function createGroup(groupData: {
  nameOfGroup: string;
  faculty: string;
  department: string;
  memberCodes: string[];
  leaderCodes: string[];
  descriptionOfGroup: string;
}): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    await post(
      '/groups',
      groupData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể tạo nhóm mới');
  }
}
