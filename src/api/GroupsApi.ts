import type { ApiGroupResponse, Group, GroupMember, ApiGroupMemberResponse } from '@/types/group.js'
import { post, get, put, deleteRequest } from "./axiosInstance.js";

export async function fetchGetMyGroups(): Promise<Group[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    const res: ApiGroupResponse = await get(
      `/groups/my-groups/${localStorage.getItem('userCode')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.result;
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể lấy danh sách nhóm');
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
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể cập nhật nhóm');
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
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể xóa nhóm');
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
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể tạo nhóm mới');
  }
}

export async function addUserToGroup(groupId: number, userCode: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    await post(
      `/groups/add-user/${groupId}/${userCode}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể thêm thành viên vào nhóm');
  }
}

export async function removeUserFromGroup(groupId: number, userCode: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    await deleteRequest(
      `/groups/remove-user/${groupId}/${userCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể xóa thành viên khỏi nhóm');
  }
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. Please log in.');
  }

  try {
    const response: ApiGroupMemberResponse = await get(
      `/groups/get-member/${groupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.result;
  } catch (error: unknown) {
    const err = error as {response?: {data?: {message?: string}}};
    throw new Error(err.response?.data?.message || 'Không thể lấy danh sách thành viên nhóm');
  }
}
