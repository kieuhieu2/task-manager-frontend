<template>
  <div class="task-details-overlay" v-if="visible">
    <div class="task-details-modal" v-if="task">
      <button class="close-btn" @click="$emit('close')">[x]</button>
      <h2>Chi tiết công việc</h2>

      <div class="task-info">
        <p><strong>Mã công việc:</strong> {{ task.taskId }}</p>

        <p>
          <strong>Tiêu đề:</strong>
          <span v-if="!isEditing">{{ editedTask.title }}</span>
          <input v-else v-model="editedTask.title" />
        </p>

        <p>
          <strong>Mô tả công việc:</strong>
          <span v-if="!isEditing">{{ editedTask.description }}</span>
          <textarea v-else v-model="editedTask.description"></textarea>
        </p>

        <p>
          <strong>Phần trăm hoàn thành:</strong>
          <span v-if="!isEditing">{{ editedTask.percentDone }}%</span>
          <input v-else type="number" v-model="editedTask.percentDone" />
        </p>

        <p><strong>ID người dùng:</strong> {{ task.userId }}</p>
        <p><strong>ID của nhóm:</strong> {{ task.groupId }}</p>
        <p><strong>Trạng thái công việc:</strong> {{ task.state }}</p>

        <p v-if="taskStore.selectedTaskFile">
          <strong>Tệp đính kèm:</strong>
          <a :href="taskStore.selectedTaskFile.fileUrl" target="_blank" download>
            Download ({{ taskStore.selectedTaskFile.fileType }})
          </a>
        </p>

        <button v-if="taskStore.selectedTaskFile" @click="downloadFile" class="file-download-btn">
          Tệp đính kèm của công việc
        </button>
      </div>

      <div class="comments-section">
        <h3>Comments</h3>
        <div class="comment-input">
          <input v-model="newComment" type="text" placeholder="Enter your comment here..." />
          <button @click="submitComment">Gửi</button>
        </div>
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
import { ref, watch } from 'vue';
import type { Task } from '@/types/task';
import { useTaskStore } from '@/stores/taskManager';
import { createComment } from '@/api/commentApi.js';

const props = defineProps<{
  task: Task | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update-task', updatedTask: Task): void;
  (e: 'delete-task'): void;
}>();

const isEditing = ref(false);
const editedTask = ref<Task>({ ...props.task } as Task);
const newComment = ref('');

watch(() => props.task, async (newTask) => {
  if (newTask) {
    editedTask.value = { ...newTask };
    try {
      await taskStore.fetchFileForTask(newTask.taskId);
    } catch (error) {
      console.error('Error fetching file for task:', error);
    }
  }
}, { immediate: true });

const toggleEdit = () => {
  if (isEditing.value && editedTask.value) {
    emit('update-task', editedTask.value);
  }
  isEditing.value = !isEditing.value;
};

const taskStore = useTaskStore();

const downloadFile = () => {
  const file = taskStore.selectedTaskFile;
  if (file) {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = `task_file.${file.fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('No file available for download');
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('Comment cannot be empty');
    return;
  }

  try {
    await createComment(props.task?.taskId || 0, newComment.value);
    alert('Comment submitted successfully');
    newComment.value = '';
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Failed to submit comment');
  }
};
</script>

<style scoped lang="scss">
@use './TaskDetails.module.scss';

.file-download-btn {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.file-download-btn:hover {
  background-color: #0056b3;
}

.comments-section {
  margin-top: 20px;
}

.comment-input {
  display: flex;
  gap: 10px;
}

.comment-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.comment-input button {
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-input button:hover {
  background-color: #218838;
}
</style>
