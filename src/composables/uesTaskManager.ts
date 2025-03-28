import { computed } from "vue";
import { TaskState } from "@/types/task.js";
import { useTaskStore } from "@/stores/taskManager.js";
import { updateTaskState } from '@/api/task.js'

interface DragEvent {
  added?: { element: { taskId: number } };
  moved?: { element: { taskId: number } };
  removed?: { element: { taskId: number } };
}

export function useTaskManager() {
  const store = useTaskStore();

  const list1 = computed(() => store.tasks.filter((task) => task.state === TaskState.TODO));
  const list2 = computed(() => store.tasks.filter((task) => task.state === TaskState.IN_PROGRESS));
  const list3 = computed(() => store.tasks.filter((task) => task.state === TaskState.DONE));
  const list4 = computed(() => store.tasks.filter((task) => task.state === TaskState.SPAM));

  const mapColumnIdToState = (columnId: string) => {
    const stateMap: { [key: string]: TaskState } = {
      "todoColumn": TaskState.TODO,
      "inProgressColumn": TaskState.IN_PROGRESS,
      "doneColumn": TaskState.DONE,
      "spamColumn": TaskState.SPAM,
    };
    console.log("Mapping columnId:", columnId, "to state:", stateMap[columnId]);
    return stateMap[columnId] || null;
  };

  const log = async (event: DragEvent, columnState: TaskState) => {
    if (event.added) {
      const task = event.added.element;
      const newState = columnState;
      const taskId = task.taskId;

      try {
        await updateTaskState(taskId, newState);
        await store.updateTask(taskId, newState);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
      }
    } else if (event.removed) {
      console.log("Task removed from column:", columnState);
    } else if (event.moved) {
      console.log("Task moved within the same column");
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
