import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { fetchTasks, updateTaskState, updateTask as updateTaskApi, deleteTask as deleteTaskApi, getFileOfTask } from '@/api/task.js'
import { type Task, TaskState } from '@/types/task.js'

export const useTaskStore = defineStore('taskStore', () => {
  const tasksByGroup = ref<{ [groupId: number]: Task[] }>({});
  const selectedTaskFile: Ref<{ fileUrl: string; fileType: string } | null> = ref(null);

  const loadTasks = async (groupId: number) => {
    try {
      const tasks = (await fetchTasks(groupId)) ?? [];
      tasksByGroup.value[groupId] = tasks.map(task => ({
        ...task,
        fileUrl: task.fileUrl || undefined,
        fileType: task.fileType ?? null,
      })) as Task[];
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Method để refresh tasks sau khi tạo mới
  const refreshTasks = async (groupId: number) => {
    try {
      const tasks = (await fetchTasks(groupId)) ?? [];
      tasksByGroup.value[groupId] = tasks.map(task => ({
        ...task,
        fileUrl: task.fileUrl || undefined,
        fileType: task.fileType ?? null,
      })) as Task[];
    } catch (error) {
      console.error('Error refreshing tasks:', error);
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

  // Fix the type issue for returnedTask by ensuring it is treated as an object
  const updateTask = async (groupId: number, updatedTask: Task) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === updatedTask.taskId);
      if (taskIndex !== -1) {
        try {
          const returnedTask = await updateTaskApi(updatedTask);
          // Ensure returnedTask is a valid object and matches the Task type
          if (returnedTask !== undefined && returnedTask !== null && typeof returnedTask === 'object' && !Array.isArray(returnedTask)) {
            const validatedTask = returnedTask as Partial<Task>;
            tasks[taskIndex] = {
              ...tasks[taskIndex], // Preserve existing task properties
              ...validatedTask,   // Merge with returnedTask properties
            } as Task;
          } else {
            console.error('Invalid returnedTask:', returnedTask);
          }
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
          await deleteTaskApi(taskId);
          tasks.splice(taskIndex, 1);
          tasksByGroup.value[groupId] = [...tasks];
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      }
    }
  };

  // Fix the type issue for selectedTaskFile
  const fetchFileForTask = async (taskId: number) => {
    try {
      const fileData = await getFileOfTask(taskId) as { fileUrl: string; fileType?: string } | void;
      if (!fileData) {
        throw new Error('Failed to fetch file data for task');
      }
      if (fileData) {
        selectedTaskFile.value = {
          fileUrl: fileData.fileUrl,
          fileType: fileData.fileType || 'unknown',
        };
      } else {
        selectedTaskFile.value = null;
      }
    } catch (error) {
      console.error('Error fetching file for task:', error);
    }
  };

  const openTask = async (groupId: number, taskId: number) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const task = tasks.find(t => t.taskId === taskId);
      if (task) {
        try {
          await fetchFileForTask(taskId); // Fetch the file for the task when it is opened
        } catch (error) {
          console.error('Error opening task:', error);
        }
      } else {
        console.error('Task not found:', taskId, 'in group:', groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  return { 
    tasksByGroup,
    selectedTaskFile,
    loadTasks,
    refreshTasks,
    getTasksForGroup,
    updateStateOfTask,
    updateTask,
    deleteTask,
    fetchFileForTask,
    openTask,
  };
});
