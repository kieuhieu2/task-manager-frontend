import { ref, watch } from 'vue';
import { useTaskStore } from '@/stores/taskManager.js';
import type { Task } from '@/types/task.js';

export function useTask(groupId: number) {
  const store = useTaskStore();

  // State
  const selectedTask = ref<Task | null>(null);
  const isTaskDetailsVisible = ref(false);
  const isEditing = ref(false);
  const editedTask = ref<Task | null>(null);

  const loadTasks = async () => {
    await store.loadTasks(groupId);
  };

  const tasksByState = (state: string) => {
    return store.getTasksForGroup(groupId).filter(task => task.state === state) || [];
  };

  const openTaskDetails = (taskId: number) => {
    const task = store.getTasksForGroup(groupId).find(t => t.taskId === taskId) || null;
    selectedTask.value = task;
    editedTask.value = task ? { ...task } : null;
    isTaskDetailsVisible.value = true;
  };

  const closeTaskDetails = () => {
    isTaskDetailsVisible.value = false;
    selectedTask.value = null;
    editedTask.value = null;
    isEditing.value = false;
  };

  const toggleEdit = async () => {
    if (isEditing.value && editedTask.value) {
      await store.updateTask(groupId, editedTask.value); // Cập nhật toàn bộ task
      selectedTask.value = { ...editedTask.value }; // Đồng bộ giao diện
    }
    isEditing.value = !isEditing.value;
  };

  const deleteTask = async () => {
    if (selectedTask.value) {
      await store.deleteTask(groupId, selectedTask.value.taskId);
      closeTaskDetails();
    }
  };

  watch(selectedTask, (newTask) => {
    if (newTask) {
      editedTask.value = { ...newTask };
    }
  });

  return {
    selectedTask,
    isTaskDetailsVisible,
    isEditing,
    editedTask,
    loadTasks,
    tasksByState,
    openTaskDetails,
    closeTaskDetails,
    toggleEdit,
    deleteTask,
  };
}
