import { computed } from "vue";
import { TaskState } from "@/types/task.js";
import { useTaskStore } from "@/store/taskManager.js";

export function useTaskManager() {
  const store = useTaskStore();

  // Dùng computed để đồng bộ các danh sách task với store
  const list1 = computed(() => store.tasks.filter((task) => task.state === TaskState.TODO));
  const list2 = computed(() => store.tasks.filter((task) => task.state === TaskState.IN_PROGRESS));
  const list3 = computed(() => store.tasks.filter((task) => task.state === TaskState.DONE));
  const list4 = computed(() => store.tasks.filter((task) => task.state === TaskState.SPAM));

  // Hàm log để kiểm tra sự thay đổi
  const log = (event: any) => {
    console.log("Task moved:", event);
    // Cập nhật trạng thái của task khi kéo thả
    const taskId = event.item.taskId;
    const newState = event.from.id; // ID của cột hiện tại
    store.updateTask(taskId, newState);
  };

  return {
    list1,
    list2,
    list3,
    list4,
    log,
  };
}
