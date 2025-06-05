import { computed, ref } from 'vue'
import { type Task, TaskState } from '@/types/task.js'
import { useTaskStore } from "@/stores/taskManager.js";
import { fetchTasks, updateTaskState } from '@/api/task.js'
import type { ComputedRef } from 'vue';

interface DragEvent {
  from?: { getAttribute: (name: string) => string | null };
  to?: { getAttribute: (name: string) => string | null };
  added?: { element: Task };
  moved?: { element: Task  };
  removed?: { element: Task  };
}

export function useTaskManager(groupId: ComputedRef<number | null>) {
  const store = useTaskStore();

  const isTaskDetailsVisible = ref(false);
  const selectedTask = ref<Task | null>(null);

  const loadTasks = async () => {
    if (groupId.value !== null) {
      await store.loadTasks(groupId.value);
    }
  };

  const tasks = computed(() => {
    if (groupId.value === null) return [];
    return store.getTasksForGroup(groupId.value);
  });

  const list1 = computed(() => tasks.value.filter((task) => task.state === TaskState.TODO));
  const list2 = computed(() => tasks.value.filter((task) => task.state === TaskState.IN_PROGRESS));
  const list3 = computed(() => tasks.value.filter((task) => task.state === TaskState.DONE));
  const list4 = computed(() => tasks.value.filter((task) => task.state === TaskState.SPAM));

  const openTaskDetails = (groupId: number, taskId: number) => {
    console.log('Opening task with taskId:', taskId, 'groupId:', groupId);
    const tasks = store.getTasksForGroup(groupId);
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      console.log('Task found:', task);
      selectedTask.value = { ...task };
      isTaskDetailsVisible.value = true;
    } else {
      console.error('Task not found:', taskId, 'in group:', groupId);
    }
    localStorage.setItem("taskId: ", taskId.toString())
  };

  const closeTaskDetails = () => {
    isTaskDetailsVisible.value = false;
    selectedTask.value = null;
  };

  const log = async (event: DragEvent, state: TaskState) => {
    console.log("Full event:", JSON.stringify(event, null, 2));

    let task: Task | null = null;
    const newState = state;

    const fromId = event.from?.getAttribute('id') || null;
    const toId = event.to?.getAttribute('id') || null;

    console.log("fromId:", fromId, "toId:", toId);

    if (event.added) {
      task = event.added.element;
      console.log("Added to state:", newState);
    } else if (event.moved) {
      task = event.moved.element;
      console.log("Moved within state:", newState);
      return; // Thoát sớm nếu chỉ di chuyển trong cùng cột
    } else if (event.removed) {
      task = event.removed.element;
      console.warn("Task đã bị xóa khỏi danh sách:", task, "From:", fromId);
      return; // Thoát sớm nếu chỉ xóa
    }

    if (!task || !newState || groupId.value === null) {
      console.error("Không tìm thấy task, trạng thái mới hoặc groupId:", task, newState, groupId.value);
      return;
    }

    const updatedTask: Task = { ...task, state: newState };

    try {
      await updateTaskState(task.taskId, newState);
      await store.updateStateOfTask(groupId.value, updatedTask);
      // Không cần reload tasks vì store đã reactive
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  return {
    list1,
    list2,
    list3,
    list4,
    log,
    openTaskDetails,
    closeTaskDetails,
    isTaskDetailsVisible,
    selectedTask,
    loadTasks,
  };
}
