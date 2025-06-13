import { useTaskStore } from '@/stores/taskManager.ts';

export const useTaskDetails = () => {
  const taskStore = useTaskStore();

  const openTaskDetails = async (groupId: number, taskId: number) => {
    await taskStore.openTask(groupId, taskId);
  };

  return {
    openTaskDetails,
  };
};