import { computed, ref } from 'vue'
import { type Task, TaskState } from '@/types/task.js'
import { useTaskStore } from "@/stores/taskStore.js";
import { updateTaskState, fetchTasks } from '@/api/task.js'
import type { ComputedRef } from 'vue';

interface DragEvent {
  from?: { getAttribute: (name: string) => string | null };
  to?: { getAttribute: (name: string) => string | null };
  added?: { element: Task; newIndex?: number };
  moved?: { element: Task; oldIndex?: number; newIndex?: number };
  removed?: { element: Task };
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

  const refreshTasks = async () => {
    if (groupId.value !== null) {
      await store.refreshTasks(groupId.value);
      store.applyAllFilters();
    }
  };

  const tasks = computed(() => {
    if (store.tasksWasFiltered && store.tasksWasFiltered.length > 0) {
      return store.tasksWasFiltered;
    }

    if (groupId.value === null) return [];
    return store.getTasksForGroup(groupId.value);
  });

  // Hàm sắp xếp tasks theo positionInColumn
  const sortTasksByPosition = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      // Nếu positionInColumn không tồn tại, mặc định là 0
      const posA = a.positionInColumn !== undefined ? a.positionInColumn : 0;
      const posB = b.positionInColumn !== undefined ? b.positionInColumn : 0;
      return posA - posB;
    });
  };

  // Lấy danh sách task và sắp xếp theo positionInColumn
  const list1 = computed(() => {
    const todoTasks = tasks.value.filter((task) => task.state === TaskState.TODO);
    return sortTasksByPosition(todoTasks);
  });

  const list2 = computed(() => {
    const inProgressTasks = tasks.value.filter((task) => task.state === TaskState.IN_PROGRESS);
    return sortTasksByPosition(inProgressTasks);
  });

  const list3 = computed(() => {
    const doneTasks = tasks.value.filter((task) => task.state === TaskState.DONE);
    return sortTasksByPosition(doneTasks);
  });

  const list4 = computed(() => {
    const spamTasks = tasks.value.filter((task) => task.state === TaskState.SPAM);
    return sortTasksByPosition(spamTasks);
  });

  const openTaskDetails = (groupId: number, taskId: number) => {
    let task: Task | undefined;

    if (store.tasksWasFiltered && store.tasksWasFiltered.length > 0) {
      task = store.tasksWasFiltered.find(t => t.taskId === taskId);
    }

    if (!task) {
      const groupTasks = store.getTasksForGroup(groupId);
      task = groupTasks.find(t => t.taskId === taskId);
    }

    if (task) {
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
    let newPosition: number | undefined;
    const newState = state;

    const fromId = event.from?.getAttribute('id') || null;
    const toId = event.to?.getAttribute('id') || null;

    console.log("fromId:", fromId, "toId:", toId);

    // Xác định task và vị trí mới
    if (event.added) {
      task = event.added.element;
      if (event.added.newIndex !== undefined) {
        newPosition = event.added.newIndex + 1;
        console.log(`Task được thêm vào ${state} ở vị trí: ${newPosition}`);

        // Xử lý ngoại lệ khi vị trí là 1
        if (newPosition === 1) {
          newPosition = 0;
        }
      }
    } else if (event.moved) {
      task = event.moved.element;
      if (event.moved.newIndex !== undefined) {
        newPosition = event.moved.newIndex + 1;
        console.log(`Task được di chuyển trong ${state} từ vị trí ${event.moved.oldIndex! + 1} đến vị trí ${newPosition}`);
      }

      // Cập nhật vị trí mới trong cùng cột
      if (task && newPosition && groupId.value !== null) {
        // ngoại lệ nếu vị trí hiện thị mới = 1 thì backend sẽ lỗi nên khi đõ sẽ gán nó = 0
        if (newPosition === 1) {
          newPosition = 0;
        }

        try {
          const response = await updateTaskState(task.taskId, task.state, newPosition);
          if (response && response.code === 1000) {
            // Refresh danh sách task để cập nhật vị trí
            await refreshTasks();
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật vị trí task:", error);
        }
      }
      return;
    } else if (event.removed) {
      task = event.removed.element;
      console.warn("Task đã bị xóa khỏi danh sách:", task, "From:", fromId);
      return;
    }

    if (!task || !newState || groupId.value === null) {
      console.error("Không tìm thấy task, trạng thái mới hoặc groupId:", task, newState, groupId.value);
      return;
    }

    // Cập nhật task khi di chuyển giữa các cột
    try {
      console.log(`Gửi request cập nhật task ${task.taskId} sang trạng thái ${newState} ở vị trí ${newPosition}`);
      const response = await updateTaskState(task.taskId, newState, newPosition);

      if (response && response.code === 1000) {
        // Refresh danh sách task để lấy dữ liệu mới
        await refreshTasks();
      } else {
        // Nếu API không thành công, vẫn cập nhật tạm thời trong store
        const updatedTask: Task = { ...task, state: newState, positionInColumn: newPosition };
        await store.updateStateOfTask(groupId.value, updatedTask);
      }

      if (store.tasksWasFiltered && store.tasksWasFiltered.length > 0) {
        store.applyAllFilters();
      }
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
    refreshTasks,
  };
}
