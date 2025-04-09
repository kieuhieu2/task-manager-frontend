import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchTasks, updateTaskState, updateTask, deleteTask } from '@/api/task.js'
import { type Task, TaskState } from '@/types/task.js'

export const useTaskStore = defineStore('taskStore', () => {
  const tasksByGroup = ref<{ [groupId: number]: Task[] }>({});

  const loadTasks = async (groupId: number) => {
    if (!tasksByGroup.value[groupId]) {
      try {
        const tasks = (await fetchTasks(groupId)) ?? [];
        tasksByGroup.value[groupId] = tasks.map(task => ({
          ...task,
          fileUrl: task.fileUrl || undefined,
          fileType: typeof task.fileType === 'string' ? task.fileType : undefined
        })) as Task[];
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  };

  const getTasksForGroup = (groupId: number) => {
    return tasksByGroup.value[groupId] || [];
  };

  const updateStateOfTask = async (groupId: number, updatedTask: Task) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === updatedTask.taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...updatedTask };
        tasksByGroup.value[groupId] = [...tasks]
        try {
          // Chỉ truyền taskId và state vào updateTaskState
          await updateTaskState(updatedTask.taskId, updatedTask.state);
        } catch (error) {
          console.error('Error updating task state:', error);
        }
      } else {
        console.error('Task not found:', updatedTask.taskId, 'in group:', groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  const updateTask = async (groupId: number, updatedTask: Task) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === updatedTask.taskId);
      if (taskIndex !== -1) {
        try {
          const returnedTask: void = await updateTask(updatedTask.taskId, updatedTask);
          tasks[taskIndex] = { ...returnedTask };
          tasksByGroup.value[groupId] = [...tasks];
        } catch (error) {
          console.error('Error updating task:', error);
        }
      } else {
        console.error('Task not found:', updatedTask.taskId, 'in group:', groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  const deleteTask = async (groupId: number, taskId: number) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex !== -1) {
        try {
          await deleteTask(groupId, taskId);
          tasks.splice(taskIndex, 1);
          tasksByGroup.value[groupId] = [...tasks];
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      }
    }
  };

  return { tasksByGroup,
    loadTasks,
    getTasksForGroup,
    updateStateOfTask,
    updateTask,
    deleteTask,
  };
});
