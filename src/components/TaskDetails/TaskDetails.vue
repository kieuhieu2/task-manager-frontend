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
        <div class="comment-item" v-for="comment in comments" :key="comment.commentId">
          <div v-if="editingCommentId === comment.commentId">
            <input v-model="editedCommentText" />
            <div class="edit-controls">
              <button class="save-btn" @click="saveEditedComment(comment.commentId)">Lưu</button>
              <button class="cancel-btn" @click="cancelEdit">Hủy</button>
            </div>
          </div>
          <div v-else>
            <div>
              <p>{{ comment.commentText }}</p>
              <span>{{ comment.userName }}</span>
            </div>
            <div class="comment-actions">
              <button @click="handleEditClick(comment.commentId, comment.commentText)">Sửa</button>
              <button @click="handleDeleteComment(comment.commentId)">Xóa</button>
            </div>
          </div>
        </div>

        <h3>Ghi chú</h3>
        <div class="comment-input">
          <input v-model="newComment" type="text" placeholder="Bạn có ghi chú gì về công việc này ..." />
          <button @click="submitComment">Gửi</button>
        </div>
      </div>

      <div class="actions">
        <button @click="$emit('delete-task')" class="delete-btn">Xóa công việc</button>
        <button @click="toggleEdit" class="edit-btn">{{ isEditing ? "Lưu" : "Sửa công việc" }}</button>
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
import { createComment, fetchComments, updateComment, deleteComment } from '@/api/commentApi.js';

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
const comments = ref<Comment[]>([]);
const editingCommentId = ref<number | null>(null);
const editedCommentText = ref<string>('');

watch(() => props.task, async (newTask) => {
  if (newTask) {
    editedTask.value = { ...newTask };
    try {
      await taskStore.fetchFileForTask(newTask.taskId);
      await loadComments(newTask.taskId);
    } catch (error) {
      console.error('Error fetching file for task:', error);
    }
  }
}, { immediate: true });

const loadComments = async (taskId: number) => {
  try {
    const result = await fetchComments(taskId);
    comments.value = result || [];
  } catch (error) {
    console.error('Không thể tải comment:', error);
  }
};

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
    await loadComments(props.task?.taskId || 0)
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Failed to submit comment');
  }
};

//cmt
const handleEditClick = (commentId: number, currentText: string) => {
  editingCommentId.value = commentId;
  editedCommentText.value = currentText;
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editedCommentText.value = '';
};

const saveEditedComment = async (commentId: number) => {
  if (!editedCommentText.value.trim()) {
    alert('Nội dung bình luận không được để trống');
    return;
  }

  try {
    await updateComment(commentId, editedCommentText.value);
    await loadComments(props.task?.taskId || 0);
    editingCommentId.value = null;
    editedCommentText.value = '';
    alert('Đã cập nhật bình luận');
  } catch (error) {
    console.error('Lỗi khi sửa bình luận:', error);
    alert('Sửa bình luận thất bại');
  }
};

const handleDeleteComment = async (commentId: number) => {
  if (!confirm('Bạn có chắc muốn xóa bình luận này không?')) return;

  try {
    await deleteComment(commentId);
    await loadComments(props.task?.taskId || 0);
    alert('Đã xóa bình luận');
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error);
    alert('Xóa bình luận thất bại');
  }
};
</script>

<style scoped lang="scss">
@use './TaskDetails.module.scss';
</style>
