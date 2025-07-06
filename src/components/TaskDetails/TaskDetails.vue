<template>
  <div class="task-details-overlay" v-if="visible">
    <div class="task-details-modal" v-if="task">
      <button class="close-btn" @click="$emit('close')">[x]</button>
      <h2>Chi tiết công việc</h2>

      <div class="task-info">
        <p><strong>Mã công việc:</strong> {{ task.taskId }}</p>

        <p>
          <strong>Tiêu đề:</strong>
          <span v-if="!isEditing || !task?.isCreator">{{ editedTask.title }}</span>
          <input v-else v-model="editedTask.title" />
        </p>

        <p>
          <strong>Mô tả công việc:</strong>
          <span v-if="!isEditing || !task?.isCreator">{{ editedTask.description }}</span>
          <textarea v-else v-model="editedTask.description"></textarea>
        </p>

        <p class="percent-row">
          <strong>Phần trăm hoàn thành:</strong>
          <template v-if="!isEditing && !canUpdatePercentDone">
            <span>{{ editedTask.percentDone }}%</span>
          </template>
          <template v-else>
            <div class="percent-slider-container">
              <input
                type="range"
                v-model="editedTask.percentDone"
                min="0"
                max="100"
                class="percent-slider"
                @change="updateTaskPercentDone"
                @input="updateSliderBackground"
                :disabled="isUpdatingPercent"
                :style="sliderStyle"
              />
              <span class="percent-value" :class="{ 'updating': isUpdatingPercent }">
                {{ editedTask.percentDone }}%
                <span v-if="isUpdatingPercent" class="updating-text">Đang cập nhật...</span>
              </span>
            </div>
          </template>
        </p>
        <div class="deadline-info">
          <span v-if="!isEditing"><strong>Hạn chót:</strong> {{ formatDeadline(task.deadline) }}</span>
          <div v-else class="deadline-edit">
            <strong>Hạn chót:</strong>
            <input
              type="date"
              v-model="editedDeadline"
              class="date-picker"
            />
          </div>
        </div>
        <!-- <p><strong>ID người dùng:</strong> {{ task.userId }}</p>
        <p><strong>ID của nhóm:</strong> {{ task.groupId }}</p> -->
        <p><strong>Trạng thái công việc:</strong> {{ task.state }}</p>

        <p v-if="task.isCreator" class="progress-link" @click="toggleProgressView">
          <strong>Tiến độ các thành viên thực hiện</strong>
        </p>

        <div v-if="taskStore.selectedTaskFile" class="file-attachment">
          <p>
            <strong>Tệp đính kèm:</strong>
            <span>{{ taskStore.selectedTaskFile.fileName || `File.${taskStore.selectedTaskFile.fileType}` }}</span>
          </p>
          <button @click="downloadFile" class="file-download-btn">
            Tải xuống tệp đính kèm
          </button>
        </div>
        <p v-else-if="task.fileUrl">
          <strong>Tệp đính kèm:</strong>
          <span>{{ task.fileUrl }}</span>
          <button @click="reloadFile" class="file-download-btn">
            Thử tải lại
          </button>
        </p>
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
            <div class="comment-actions" v-if="comment.userCode === currentUserCode">
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
        <button v-if="task?.isCreator" @click="$emit('delete-task')" class="delete-btn">Xóa công việc</button>
        <button v-if="task?.isCreator" @click="toggleEdit" class="edit-btn">{{ isEditing ? "Lưu" : "Sửa công việc" }}</button>
      </div>

      <WorkProgressOfMenberLayout v-if="showProgressView && task?.isCreator" @close="showProgressView = false" />
    </div>
    <div class="task-details-modal" v-else>
      <button class="close-btn" @click="$emit('close')">[x]</button>
      <p>Task not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type { Task } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore.js';
import { createComment, fetchComments, updateComment, deleteComment } from '@/api/commentApi.js';
import { updatePercentDone, updateTask } from '@/api/task.js';
import WorkProgressOfMenberLayout from '@/components/WorkProgressOfMenberLayout.vue';

interface Comment {
  commentId: number;
  commentText: string;
  userName: string;
  userCode: string;
}

const formatDeadline = (deadline?: string): string => {
  if (!deadline) return 'Không có hạn chót';
  const date = new Date(deadline);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

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
const editedDeadline = ref('');
const newComment = ref('');
const comments = ref<Comment[]>([]);
const editingCommentId = ref<number | null>(null);
const editedCommentText = ref<string>('');
const showProgressView = ref(false);
const isUpdatingPercent = ref(false);

const taskStore = useTaskStore();

const canUpdatePercentDone = computed(() => {
  return !!props.task && !!props.task.userId;
});

const sliderStyle = computed(() => {
  const percent = editedTask.value?.percentDone || 0;
  return {
    background: `linear-gradient(to right, #28a745 0%, #28a745 ${percent}%, #ddd ${percent}%, #ddd 100%)`
  };
});

watch(() => props.task, async (newTask) => {
  if (newTask) {
    editedTask.value = { ...newTask };
    editedDeadline.value = formatDateForInput(newTask.deadline);
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
    comments.value = result as unknown as Comment[];
  } catch (error) {
    console.error('Không thể tải comment:', error);
  }
};

const toggleEdit = async () => {
  if (!props.task?.isCreator) {
    return;
  }

  if (isEditing.value && editedTask.value) {
    try {
      // Validate form data
      if (!editedTask.value.title.trim()) {
        alert('Tiêu đề không được để trống');
        return;
      }

      // Update the deadline from the date picker
      editedTask.value.deadline = editedDeadline.value;

      // Call the API to update the task
      const updatedTask = await updateTask(editedTask.value);

      // Update local task data with all fields from API response
      editedTask.value = { ...editedTask.value, ...updatedTask };

      // Update editedDeadline with the returned deadline
      editedDeadline.value = formatDateForInput(updatedTask.deadline);

      // Update task in the taskStore if it belongs to a group
      if (updatedTask.groupId) {
        await taskStore.updateTask(updatedTask.groupId, updatedTask);
      }

      // Notify parent component that task was updated with the latest data
      emit('update-task', updatedTask);

      // Show success message
      alert('Công việc đã được cập nhật thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật công việc:', error);
      alert('Không thể cập nhật công việc');
      // Stay in edit mode if update failed
      return;
    }
  } else {
    // When entering edit mode, initialize the date picker with current deadline
    editedDeadline.value = formatDateForInput(editedTask.value.deadline);
  }

  // Toggle edit mode
  isEditing.value = !isEditing.value;
};

const downloadFile = () => {
  const file = taskStore.selectedTaskFile;
  if (file) {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.fileName || `task_file.${file.fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('No file available for download');
    alert('Không thể tải tệp đính kèm');
  }
};

const reloadFile = async () => {
  try {
    await taskStore.fetchFileForTask(props.task?.taskId || 0);
    if (taskStore.selectedTaskFile) {
      alert('Đã tải lại tệp đính kèm thành công');
    } else {
      alert('Không tìm thấy tệp đính kèm');
    }
  } catch (error) {
    console.error('Error reloading file:', error);
    alert('Không thể tải lại tệp đính kèm');
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
const currentUserCode = ref<string>('');

onMounted(() => {
  const storedUserCode = localStorage.getItem('userCode');
  if (storedUserCode) {
    currentUserCode.value = storedUserCode;
  }
});

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

const updateTaskPercentDone = async () => {
  if (!props.task) {
    alert('Không thể cập nhật phần trăm hoàn thành');
    return;
  }

  const userId = props.task.userId;
  if (!userId) {
    alert('Không thể xác định người dùng cho công việc này');
    return;
  }

  try {
    // Ensure percentDone is a number
    const percentDoneValue = parseInt(editedTask.value.percentDone as unknown as string) || 0;

    isUpdatingPercent.value = true;

    await updatePercentDone(
      props.task.taskId,
      userId,
      percentDoneValue
    );

  } catch (error) {
    console.error('Lỗi khi cập nhật phần trăm hoàn thành:', error);
    alert('Không thể cập nhật phần trăm hoàn thành');
  } finally {
    isUpdatingPercent.value = false;
  }
};

const toggleProgressView = () => {
  showProgressView.value = !showProgressView.value;
};

const updateSliderBackground = () => {
  // This function is empty because the computed property sliderStyle automatically updates
  // when editedTask.percentDone changes during dragging
};
</script>

<style scoped lang="scss">
@use './TaskDetails.module.scss';
</style>
