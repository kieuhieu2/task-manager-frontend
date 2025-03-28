import { computed } from "vue";
import { TaskState } from "@/types/task.js";
import { useTaskStore } from "@/stores/taskManager.js";
import { updateTaskState } from '@/api/task.js'
import type { ComputedRef } from 'vue';

interface DragEvent {
  from?: { getAttribute: (name: string) => string | null };
  to?: { getAttribute: (name: string) => string | null };
  added?: { element: { taskId: number } };
  moved?: { element: { taskId: number } };
  removed?: { element: { taskId: number } };
}

export function useTaskManager(groupId: ComputedRef<number | null>) {
  const store = useTaskStore();

  const tasks = computed(() => {
    if (groupId.value === null) return [];
    return store.getTasksForGroup(groupId.value);
  });

  const list1 = computed(() => tasks.value.filter((task) => task.state === TaskState.TODO));
  const list2 = computed(() => tasks.value.filter((task) => task.state === TaskState.IN_PROGRESS));
  const list3 = computed(() => tasks.value.filter((task) => task.state === TaskState.DONE));
  const list4 = computed(() => tasks.value.filter((task) => task.state === TaskState.SPAM));

  const log = async (event: DragEvent, state: TaskState) => {
    console.log("Full event:", JSON.stringify(event, null, 2));

    let task = null;
    const newState = state; // Sử dụng state được truyền vào trực tiếp

    const fromId = event.from?.getAttribute('id') || null;
    const toId = event.to?.getAttribute('id') || null;

    console.log("fromId:", fromId, "toId:", toId);

    if (event.added) {
      task = event.added.element;
      console.log("Added to state:", newState);
    } else if (event.moved) {
      task = event.moved.element;
      // Không cần cập nhật state vì di chuyển trong cùng cột không thay đổi trạng thái
      console.log("Moved within state:", newState);
      return; // Thoát sớm vì không cần cập nhật khi di chuyển trong cùng cột
    } else if (event.removed) {
      task = event.removed.element;
      console.warn("Task đã bị xóa khỏi danh sách:", task, "From:", fromId);
      return; // Thoát sớm vì không cần cập nhật trạng thái khi chỉ xóa
    }

    console.log("Task:", task, "New State:", newState);

    if (!task || !newState || groupId.value === null) {
      console.error("Không tìm thấy task, trạng thái mới hoặc groupId:", task, newState, groupId.value);
      return;
    }

    const taskId = task.taskId;

    try {
      await updateTaskState(taskId, newState);
      await store.updateTask(groupId.value, taskId, newState);
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
  };
}
