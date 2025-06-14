import { useTaskStore } from '@/stores/taskStore.ts';

export const useTaskDetails = () => {
  const taskStore = useTaskStore();

  const openTaskDetails = async (groupId: number, taskId: number) => {
    await taskStore.openTask(groupId, taskId);
  };

  return {
    openTaskDetails,
  };
};
