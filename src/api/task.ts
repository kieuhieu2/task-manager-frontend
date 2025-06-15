import type { Task } from '@/types/task.js'
import type { ApiResponse } from '@/types/api.js'
import { get, put, post } from './axiosInstance.js'
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

export async function updateTaskState(taskId: number, newState: string) {
  const token = localStorage.getItem('token')
  await put(
    `/tasks/update-state/${taskId}/${newState}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export async function deleteTask(taskId: number): Promise<string> {
  return 'task was deleted'
}

export async function updateTask(editedTask: Task): Promise<Task> {
  return {
    taskId: editedTask.taskId,
    title: editedTask.title,
    description: editedTask.description,
    percentDone: editedTask.percentDone,
    userId: editedTask.userId,
    groupId: editedTask.groupId,
    state: editedTask.state,
    fileUrl: editedTask.fileUrl,
    fileType: editedTask.fileType,
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
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
      },
    });

    // Extract the filename from the Content-Disposition header
    const contentDisposition = response.headers['Content-Disposition'];
    const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : `downloaded_file`; // Correctly extract filename

    console.log('Filename:', filename); // Log the filename for debugging
    console.log('Content-Disposition:', contentDisposition); // Log the Content-Disposition header for debugging
    console.log('Response Headers:', response.headers); // Log all response headers for debugging

    // Extract the file type from the filename
    const fileType = filename.split('.').pop() || 'unknown';

    // Create a Blob URL for the file
    const fileUrl = URL.createObjectURL(response.data);

    return {
      fileUrl,
      fileType, // Use the extracted file extension as fileType
      fileName: filename, // Use filename from Content-Disposition
    };
  } catch (error) {
    console.error('Error fetching file for task:', error);
    throw error;
  }
};


