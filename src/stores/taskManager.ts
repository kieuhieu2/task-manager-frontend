import { defineStore } from "pinia";
import { ref } from "vue";
import { updateTaskState } from "@/api/task.js";
import type { Task } from "@/types/task.js";
import { get} from '@/api/axiosInstance.js';
import type { ApiResponse } from '@/types/api.js'

export const useTaskStore = defineStore('taskStore', () => {
  const tasksByGroup = ref<{ [groupId: number]: Task[] }>({});

  const loadTasks = async (groupId: number) => {
    if (!tasksByGroup.value[groupId]) {
      try {
        const response = await get(`tasks/${groupId}`);
        tasksByGroup.value[groupId] = await response.result;
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  };

  const getTasksForGroup = (groupId: number) => {
    return tasksByGroup.value[groupId] || [];
  };

  const updateTask = async (groupId: number, taskId: number, newState: string) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const task = tasks.find(t => t.taskId === taskId);
      if (task) {
        task.state = newState;
        try {
          await updateTaskState(taskId, newState);
        } catch (error) {
          console.error('Error updating task state:', error);
        }
      } else {
        console.error('Task not found in group:', taskId, groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  return { tasksByGroup, loadTasks, getTasksForGroup, updateTask };
});
