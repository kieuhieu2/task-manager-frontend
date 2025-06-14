import { ref, watch } from 'vue';
import { useTaskStore } from '@/stores/taskStore.ts';
import type { Task } from '@/types/task.js';
import { onMounted } from 'vue';
import { useCommentsStore } from '@/stores/commentStore.js'
import { storeToRefs } from 'pinia'

export function useTask(groupId: number) {
  const store = useTaskStore();
  const selectedTask = ref<Task | null>(null);
  const isTaskDetailsVisible = ref(false);
  const isEditing = ref(false);
  const editedTask = ref<Task | null>(null);

  // Task
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
      await store.updateTask(groupId, editedTask.value);
      selectedTask.value = { ...editedTask.value };
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
  // End task

  // Comment

  // end comment

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

export function useTaskDetails(taskId: number) {
  const taskManagerStore = useTaskStore();

  onMounted(() => {
    taskManagerStore.fetchFileForTask(taskId);
  });

  return {
    selectedTaskFile: taskManagerStore.selectedTaskFile,
  };
}
