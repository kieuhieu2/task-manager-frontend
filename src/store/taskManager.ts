// src/store/useTaskStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchTasks, updateTaskState } from "@/api/task.js";
import type { Task, TaskState } from "@/types/task.js";

export const useTaskStore = defineStore("taskStore", () => {
  const tasks = ref<Task[]>([]);

  // Tải danh sách task theo groupId
  const loadTasks = async (groupId: number) => {
    try {
      const response = await fetchTasks(groupId);  // Gọi API lấy danh sách task
      tasks.value = response;  // Lưu danh sách task vào store
    } catch (error) {
      console.error("Lỗi khi tải danh sách task:", error);
    }
  };

  const updateTask = async (taskId: number, newState: TaskState) => {
    try {
      // Gọi API để cập nhật trạng thái task
      await updateTaskState(taskId, newState);

      // Cập nhật trạng thái task trong local state
      const task = tasks.value.find((t) => t.taskId === taskId);
      if (task) task.state = newState;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái task:", error);
      throw new Error("Không thể cập nhật trạng thái task");
    }
  };

  return { tasks, loadTasks, updateTask };
});
