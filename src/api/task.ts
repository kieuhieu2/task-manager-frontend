import type { Task } from '@/types/task.js'
import type { ApiResponse } from '@/types/api.js'
import { get, put } from './axiosInstance.js'

export async function fetchTasks(groupId: number): Promise<Task[] | undefined> {
  try {
    const res: ApiResponse<Task[]> = await get(`/tasks/${groupId}`, {})

    return res.result
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách công việc')
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
