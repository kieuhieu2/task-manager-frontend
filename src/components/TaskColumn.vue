<template>
  <div class="task-column">
    <h3>{{ title }}</h3>
    <draggable :list="tasks" group="tasks" @change="handleDrag">
      <template #item="{ element }">
        <TaskItem :task="element" />
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import TaskItem from "./TaskItem.vue";
import { useTaskStore } from "@/stores/taskManager.js";
import { computed } from 'vue'

defineProps<{ title: string; status: string }>();
const taskStore = useTaskStore();

const tasks = computed(() => taskStore.tasks.filter((t) => t.state === status));

const handleDrag = async (event: any) => {
  const { moved } = event;
  if (moved) {
    try {
      await taskStore.updateTask(moved.element.taskId, status);
    } catch {
      // Nếu cập nhật thất bại, hoàn tác thay đổi
      taskStore.loadTasks(moved.element.groupId);
    }
  }
};
</script>

<style scoped lang="scss">
.task-column {
  width: 25%;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 8px;
  min-height: 300px;
}
</style>
