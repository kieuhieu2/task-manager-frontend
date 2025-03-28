import type { Task } from "@/types/task.js";
import { get, put } from '@/api/axiosInstance.js'

export async function fetchTasks(groupId: number): Promise<Task[]> {
  const res = await get<{ code: number; result: Task[] }>(`/tasks/${groupId}`);
  return res.result;
}

// Cập nhật trạng thái task
export async function updateTaskState(taskId: number, newState: string) {
  await put(
    `/tasks/update-state/${taskId}/${newState}`,
    {}
  );
}
