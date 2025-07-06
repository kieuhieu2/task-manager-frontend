import type { Task } from '@/types/task.js'
import type { ApiResponse } from '@/types/api.js'
import { get } from './axiosInstance.js'
import axiosInstance from './axiosInstance.js';

export async function createTask(formData: FormData): Promise<Task> {
  try {
    const res = await axiosInstance.post('/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return res.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể tạo task');
  }
}

export async function fetchTasks(groupId: number): Promise<Task[] | undefined> {
  try {
    const res: ApiResponse<Task[]> = await get(`/tasks/${groupId}`, {})
    return res.result
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy danh sách công việc')
  }
}

export async function fetchTasksByDateRange(userCode: string, fromDate: string, toDate: string): Promise<Task[] | undefined> {
  try {
    const token = localStorage.getItem('token');
    const res = await axiosInstance.post('/tasks/date-range',
      { userCode, fromDate, toDate },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy danh sách công việc theo khoảng thời gian');
  }
}

export async function updateTaskState(taskId: number, newState: string, positionInColumn?: number) {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(
      '/tasks/update-task-state',
      {
        taskId,
        newState,
        positionInColumn
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể cập nhật trạng thái công việc');
  }
}

export async function deleteTask(taskId: number): Promise<string> {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.message || 'Task đã được xóa';
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể xóa task');
  }
}

export async function updateTask(editedTask: Task): Promise<Task> {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/tasks',
      {
        taskId: editedTask.taskId,
        title: editedTask.title,
        description: editedTask.description,
        deadline: editedTask.deadline
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.result;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể cập nhật task');
  }
}

export interface WorkProgress {
  userCode: string;
  state: string;
  percentDone: number;
  updatedAt: string;
}

export async function fetchWorkProgress(taskId: number): Promise<WorkProgress[]> {
  try {
    const res: ApiResponse<WorkProgress[]> = await get(`/tasks/work-progress/${taskId}`, {});
    return res.result || [];
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể lấy tiến độ công việc');
  }
}

export const getFileOfTask = async (taskId: number): Promise<{ fileUrl: string; fileType?: string; fileName?: string }> => {
  try {
    const response = await axiosInstance.get(`/tasks/file/${taskId}`, {
      responseType: 'blob', // Set the response type to 'blob' to handle binary data
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    // Extract the filename from the Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : `downloaded_file`;

    // Extract the file type from the filename
    const fileType = filename.split('.').pop() || 'unknown';

    // Create a Blob URL for the file
    const fileUrl = URL.createObjectURL(response.data);

    return {
      fileUrl,
      fileType,
      fileName: filename,
    };
  } catch (error) {
    console.error('Error fetching file for task:', error);
    throw error;
  }
};

export async function updatePercentDone(taskId: number, userId: string, percentDone: number): Promise<void> {
  try {
    const token = localStorage.getItem('token');

    await axiosInstance.put(`/tasks/percent-done/${taskId}`,
      { userId, percentDone },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Không thể cập nhật phần trăm hoàn thành');
  }
}


