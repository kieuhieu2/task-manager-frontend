<template>
  <div class="task-details-overlay" v-if="visible">
    <div class="task-details-modal" v-if="task">
      <button class="close-btn" @click="$emit('close')">[x]</button>
      <h2>Task Details</h2>

      <div class="task-info">
        <p><strong>Task ID:</strong> {{ task.taskId }}</p>

        <p>
          <strong>Title:</strong>
          <span v-if="!isEditing">{{ editedTask.title }}</span>
          <input v-else v-model="editedTask.title" />
        </p>

        <p>
          <strong>Description:</strong>
          <span v-if="!isEditing">{{ editedTask.description }}</span>
          <textarea v-else v-model="editedTask.description"></textarea>
        </p>

        <p>
          <strong>Percent Done:</strong>
          <span v-if="!isEditing">{{ editedTask.percentDone }}%</span>
          <input v-else type="number" v-model="editedTask.percentDone" />
        </p>

        <p><strong>User ID:</strong> {{ task.userId }}</p>
        <p><strong>Group ID:</strong> {{ task.groupId }}</p>
        <p><strong>State:</strong> {{ task.state }}</p>

        <p v-if="task.fileUrl">
          <strong>File Attachment:</strong>
          <a :href="task.fileUrl" target="_blank" download>Download ({{ task.fileType }})</a>
        </p>
      </div>

      <div class="actions">
        <button @click="$emit('delete-task')" class="delete-btn">Xóa</button>
        <button @click="toggleEdit" class="edit-btn">{{ isEditing ? "Lưu" : "Sửa" }}</button>
      </div>
    </div>
    <div class="task-details-modal" v-else>
      <button class="close-btn" @click="$emit('close')">[x]</button>
      <p>Task not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import type { Task } from '@/types/task';

// Định nghĩa props
const props = defineProps<{
  task: Task | null;
  visible: boolean;
}>();

// Định nghĩa emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update-task', updatedTask: Task): void;
  (e: 'delete-task'): void;
}>();

// State nội bộ
const isEditing = ref(false);
const editedTask = ref<Task>({ ...props.task } as Task);

// Đồng bộ editedTask khi props.task thay đổi
watch(() => props.task, (newTask) => {
  if (newTask) {
    editedTask.value = { ...newTask };
  }
}, { immediate: true });

// Xử lý toggle edit và emit dữ liệu khi lưu
const toggleEdit = () => {
  if (isEditing.value && editedTask.value) {
    emit('update-task', editedTask.value); // Gửi task đã chỉnh sửa lên cha
  }
  isEditing.value = !isEditing.value;
};
</script>

<style scoped lang="scss">
@use './TaskDetails.module.scss';
</style>
