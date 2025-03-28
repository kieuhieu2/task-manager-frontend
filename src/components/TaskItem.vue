<template>
  <div class="task-item">
    <h4>{{ task.title }}</h4>
    <p>{{ task.description }}</p>
    <div class="progress-bar">
      <div :style="{ width: task.percentDone + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "@/types/task";
defineProps<{ task: Task }>();
</script>

<style scoped lang="scss">
.task-item {
  background: white;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.progress-bar {
  height: 5px;
  background: #e0e0e0;
  margin-top: 5px;
}
.progress-bar div {
  height: 100%;
  background: green;
}
</style>
