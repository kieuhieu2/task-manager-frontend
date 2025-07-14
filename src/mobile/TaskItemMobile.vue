<template>
  <div class="task-item-mobile" :class="{ 'expanded': isExpanded }" :style="{ backgroundColor: backgroundColorBasedOnDeadline }">
    <!-- Collapsed view (always visible) -->
    <div class="task-header" @click="toggleExpand">
      <div class="task-basic-info">
        <h4 class="task-title">{{ storeTask.title }}</h4>
        <p class="task-description" v-if="!isExpanded">{{ storeTask.description }}</p>
      </div>
      <div class="task-indicators">
        <div class="task-meta">
          <div class="percent-badge">
            {{ storeTask.percentDone }}%
          </div>
          <div class="deadline" v-if="storeTask.deadline">
            <Icon icon="lucide:clock" width="14" height="14" />
            <span>{{ formatDeadline(storeTask.deadline) }}</span>
            <span class="days-left" v-if="daysUntilDeadline !== null">
              {{ displayDaysLeft(daysUntilDeadline) }}
            </span>
          </div>
        </div>
        <div class="expand-area">
          <!-- Add creator indicator next to chevron -->
          <span class="creator-indicator" v-if="storeTask.isCreator">
            Bạn đã giao công việc này
          </span>
          <Icon :icon="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" width="20" height="20" class="expand-icon" />
        </div>
      </div>
    </div>

    <!-- Expanded view (only visible when expanded) -->
    <div class="task-details" v-if="isExpanded">
      <div class="details-section">
        <div class="detail-row">
          <strong>Mã công việc:</strong>
          <span>{{ storeTask.taskId }}</span>
        </div>

        <div class="detail-row">
          <strong>Tiêu đề:</strong>
          <span v-if="!isEditing || !storeTask.isCreator">{{ storeTask.title }}</span>
          <input v-else v-model="editedTask.title" class="edit-input" />
        </div>

        <div class="detail-row">
          <strong>Mô tả:</strong>
          <p v-if="!isEditing || !storeTask.isCreator">{{ storeTask.description }}</p>
          <textarea v-else v-model="editedTask.description" class="edit-textarea"></textarea>
        </div>

        <div class="detail-row percent-row">
          <strong>Tiến độ:</strong>
          <div class="percent-slider-container">
            <input
              type="range"
              v-model="localPercentDone"
              min="0"
              max="100"
              class="percent-slider"
              @change="updateTaskPercentDone"
              :style="sliderStyle"
              :disabled="isUpdatingPercent || !canUpdatePercentDone"
            />
            <span class="percent-value" :class="{ 'updating': isUpdatingPercent }">
              {{ localPercentDone }}%
              <span v-if="isUpdatingPercent" class="updating-text">Đang cập nhật...</span>
            </span>
          </div>
        </div>

        <div class="detail-row">
          <strong>Hạn chót:</strong>
          <span>{{ formatDeadline(storeTask.deadline) }}</span>
        </div>

        <div class="detail-row">
          <strong>Trạng thái:</strong>
          <span>{{ getStatusLabel(storeTask.state) }}</span>
        </div>

        <div v-if="taskStore.selectedTaskFile" class="detail-row">
          <strong>Tệp đính kèm:</strong>
          <div class="file-download">
            <span>{{ taskStore.selectedTaskFile.fileName || `File.${taskStore.selectedTaskFile.fileType}` }}</span>
            <button @click="downloadFile" class="file-download-btn">Tải xuống</button>
          </div>
        </div>

        <div v-if="isEditing" class="detail-row">
          <strong>Cập nhật file:</strong>
          <input type="file" @change="handleFileChange" class="file-input" />
        </div>
      </div>

      <!-- Comments section -->
      <div class="comments-section">
        <h3>Ghi chú</h3>
        <div class="comments-list">
          <div class="comment-item" v-for="comment in comments" :key="comment.commentId">
            <div v-if="editingCommentId === comment.commentId" class="comment-edit-form">
              <input v-model="editedCommentText" class="edit-input" />
              <div class="edit-controls">
                <button class="save-btn" @click="saveEditedComment(comment.commentId)">Lưu</button>
                <button class="cancel-btn" @click="cancelEdit">Hủy</button>
              </div>
            </div>
            <div v-else class="comment-display">
              <div class="comment-content">
                <p>{{ comment.commentText }}</p>
                <span class="comment-user">
                  {{ comment.userName }}
                </span>
              </div>
              <div class="comment-actions" v-if="comment.userCode === userCode">
                <button class="action-link edit-link" @click="handleEditClick(comment.commentId, comment.commentText)">
                  Sửa
                </button>
                <button class="action-link delete-link" @click="handleDeleteComment(comment.commentId)">
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <div v-if="comments.length === 0" class="no-comments">
            <p>Chưa có ghi chú nào</p>
          </div>
        </div>

        <div class="comment-input">
          <div class="attachment-icon">
            <Icon icon="lucide:paperclip" width="20" height="20" @click="triggerFileInput" />
            <input
              type="file"
              ref="commentFileInput"
              style="display: none"
              @change="handleCommentFileChange"
            />
            <span v-if="commentFile" class="file-badge">1</span>
          </div>
          <input v-model="newComment" type="text" placeholder="Nhập ghi chú..." />
          <button @click="submitComment">
            <Icon icon="lucide:send" width="20" height="20" />
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button v-if="storeTask.isCreator" @click="handleDeleteTask" class="delete-btn">
          <Icon icon="lucide:trash" width="16" height="16" />
          Xóa công việc
        </button>
        <button v-if="storeTask.isCreator" @click="toggleEdit" class="edit-btn">
          <!-- <Icon icon="lucide:edit" width="16" height="16" /> -->
          {{ isEditing ? "Lưu" : "Sửa công việc" }}
        </button>
        <button @click="toggleStatusSelector" class="status-btn">
          <Icon icon="lucide:refresh-cw" width="16" height="16" />
          Chuyển trạng thái
        </button>
      </div>
    </div>
  </div>

  <!-- Status selection overlay -->
  <div class="status-overlay" v-if="showStatusSelector" @click="closeStatusSelector">
    <div class="status-selector" @click.stop>
      <h3>Chọn trạng thái</h3>
      <div class="status-options">
        <button
          class="status-option"
          :class="{ active: storeTask.state === TaskState.TODO }"
          @click="changeStatus(TaskState.TODO)"
        >
          Cần làm
        </button>
        <button
          class="status-option"
          :class="{ active: storeTask.state === TaskState.IN_PROGRESS }"
          @click="changeStatus(TaskState.IN_PROGRESS)"
        >
          Đang làm
        </button>
        <button
          class="status-option"
          :class="{ active: storeTask.state === TaskState.DONE }"
          @click="changeStatus(TaskState.DONE)"
        >
          Đã xong
        </button>
        <button
          class="status-option"
          :class="{ active: storeTask.state === TaskState.SPAM }"
          @click="changeStatus(TaskState.SPAM)"
        >
          Rác
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useTaskStore } from '@/stores/taskStore.js';
import { useCommentsStore } from '@/stores/commentStore.js';
import { updatePercentDone, updateTaskState } from '@/api/task.js';
import type { Task } from '@/types/task.js';
import { TaskState } from '@/types/task.js';

// Props and emits
const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'update-task', updatedTask: Task): void;
  (e: 'delete-task'): void;
  (e: 'edit-task'): void;
}>();

// State variables
const isExpanded = ref(false);
const newComment = ref('');
const editingCommentId = ref<number | null>(null);
const editedCommentText = ref('');
const isUpdatingPercent = ref(false);
const taskStore = useTaskStore();
const commentStore = useCommentsStore();
const currentUserCode = ref(localStorage.getItem('currentUserCode') || '');
const userCode = ref(localStorage.getItem('userCode') || '');
const isEditing = ref(false);
const editedTask = ref<Task>({} as Task);
const selectedFile = ref<File | null>(null);
const commentFile = ref<File | null>(null);
const commentFileInput = ref<HTMLInputElement | null>(null);
const showStatusSelector = ref(false);
const isChangingStatus = ref(false);

// Get the task from store to ensure we have the latest data
const storeTask = computed(() => {
  const tasks = taskStore.getTasksForGroup(props.task.groupId);
  return tasks.find(t => t.taskId === props.task.taskId) || props.task;
});

// Get comments from store
const comments = computed(() => commentStore.comments || []);

// Get percentage from store
const localPercentDone = ref(storeTask.value.percentDone || 0);

// Watch for changes in store task
watch(() => storeTask.value, (newTask) => {
  if (newTask) {
    editedTask.value = { ...newTask };
  }
}, { immediate: true });

// Watch for changes in store task
watch(() => storeTask.value.percentDone, (newPercentage) => {
  if (newPercentage !== undefined) {
    localPercentDone.value = newPercentage;
  }
});

// Computed properties
const canUpdatePercentDone = computed(() => {
  return !!storeTask.value && !!storeTask.value.userId;
});

const sliderStyle = computed(() => {
  const percent = localPercentDone.value || 0;
  return {
    background: `linear-gradient(to right, #28a745 0%, #28a745 ${percent}%, #ddd ${percent}%, #ddd 100%)`
  };
});

// Format deadline for display
const formatDeadline = (deadline?: string): string => {
  if (!deadline) return 'Không có hạn chót';
  try {
    const date = new Date(deadline);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch (error) {
    console.error('Error formatting deadline:', error);
    return deadline;
  }
};

// Calculate days left until deadline
const daysUntilDeadline = computed(() => {
  if (!storeTask.value.deadline) return null;

  const deadline = new Date(storeTask.value.deadline);
  const today = new Date();

  // Reset hours to compare just the dates
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const differenceInTime = deadline.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

  return differenceInDays;
});

// Get display label for task status
const getStatusLabel = (state: string): string => {
  switch(state) {
    case TaskState.TODO:
      return 'Cần làm';
    case TaskState.IN_PROGRESS:
      return 'Đang làm';
    case TaskState.DONE:
      return 'Đã xong';
    case TaskState.SPAM:
      return 'Rác';
    default:
      return state;
  }
};

// Toggle status selector overlay
const toggleStatusSelector = () => {
  showStatusSelector.value = !showStatusSelector.value;
};

// Close status selector overlay
const closeStatusSelector = () => {
  showStatusSelector.value = false;
};

// Change task status
const changeStatus = async (newState: TaskState) => {
  if (isChangingStatus.value || storeTask.value.state === newState) {
    return;
  }

  isChangingStatus.value = true;
  try {
    // Call API to update task state
    await updateTaskState(storeTask.value.taskId, newState, 1);

    // Create updated task object with new state
    const updatedTask = {
      ...storeTask.value,
      state: newState
    };

    // Update local state and emit to parent
    emit('update-task', updatedTask);

    // Refresh tasks list from server to get updated data
    await taskStore.refreshTasks(storeTask.value.groupId);

    // Close the status selector
    closeStatusSelector();
  } catch (error) {
    console.error('Error changing task status:', error);
  } finally {
    isChangingStatus.value = false;
  }
};

// Determine background color based on days left
const backgroundColorBasedOnDeadline = computed(() => {
  const daysLeft = daysUntilDeadline.value;

  if (daysLeft === null) return '#ffffff'; // No deadline

  if (daysLeft < 0) {
    return '#ffcdd2'; // Red background for past-due tasks
  } else if (daysLeft <= 1) {
    return '#ffebee'; // Light red if deadline is today or tomorrow
  } else if (daysLeft <= 3) {
    return '#fff3e0'; // Light orange if deadline is within 3 days
  } else if (daysLeft <= 7) {
    return '#ffffff'; // White if deadline is within 7 days
  } else {
    return '#ffffff'; // White for deadlines beyond 7 days
  }
});

// Format days left display
const displayDaysLeft = (days: number) => {
  if (days < 0) return '(Quá hạn)';
  if (days === 0) return '(Hôm nay)';
  if (days === 1) return '(Còn 1 ngày)';
  return `(Còn ${days} ngày)`;
};

// Toggle expanded state
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;

  // Load task details when expanded
  if (isExpanded.value) {
    loadTaskDetails();
  }
};

// Load task details, comments and file
const loadTaskDetails = async () => {
  try {
    await loadComments(props.task.taskId);
    await taskStore.fetchFileForTask(props.task.taskId);
    // Update localPercentDone with the latest value from store
    const latestTask = storeTask.value;
    if (latestTask) {
      localPercentDone.value = latestTask.percentDone;
    }
  } catch (error) {
    console.error('Error loading task details:', error);
  }
};

// Load comments for the task using store
const loadComments = async (taskId: number) => {
  try {
    await commentStore.fetchComments(taskId);
  } catch (error) {
    console.error('Không thể tải comment:', error);
  }
};

// Update task percent done
const updateTaskPercentDone = async () => {
  isUpdatingPercent.value = true;
  try {
    await updatePercentDone(props.task.taskId, props.task.userId, localPercentDone.value);
    // Update the task in store via emit to parent
    emit('update-task', { ...storeTask.value, percentDone: localPercentDone.value });
  } catch (error) {
    console.error('Error updating percent done:', error);
  } finally {
    isUpdatingPercent.value = false;
  }
};

// Download attached file
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
  }
};

// Comment functions
const submitComment = async () => {
  if (!newComment.value.trim() && !commentFile.value) return;

  try {
    if (commentFile.value) {
      // Call API to add file with comment
      const formData = new FormData();
      formData.append('taskId', props.task.taskId.toString());
      formData.append('commentText', newComment.value);
      formData.append('file', commentFile.value);

      // TODO: Replace with actual API call
      // await commentStore.addFileByCommnentId(formData);
      console.log('Adding comment with file:', formData);
    } else {
      // Use existing API for text-only comments
      await commentStore.createComment(props.task.taskId, newComment.value);
    }

    // Reset form
    newComment.value = '';
    commentFile.value = null;

    // Comments are already reloaded by the store actions
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
};

// Trigger file input click
const triggerFileInput = () => {
  if (commentFileInput.value) {
    commentFileInput.value.click();
  }
};

// Handle file selection for comments
const handleCommentFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    commentFile.value = input.files[0];
  }
};

const handleEditClick = (commentId: number, commentText: string) => {
  editingCommentId.value = commentId;
  editedCommentText.value = commentText;
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editedCommentText.value = '';
};

const saveEditedComment = async (commentId: number) => {
  try {
    // Update commentStore.ts to include this action if not already there
    await commentStore.updateComment(commentId, editedCommentText.value);
    await loadComments(props.task.taskId);
    cancelEdit();
  } catch (error) {
    console.error('Error updating comment:', error);
  }
};

const handleDeleteComment = async (commentId: number) => {
  try {
    // Update commentStore.ts to include this action if not already there
    await commentStore.deleteComment(commentId);
    await loadComments(props.task.taskId);
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

// Toggle edit mode
const toggleEdit = async () => {
  if (isEditing.value) {
    // Save changes
    try {
      if (selectedFile.value) {
        // Handle file upload with form data
        const formData = new FormData();
        formData.append('taskId', editedTask.value.taskId.toString());
        formData.append('title', editedTask.value.title);
        formData.append('description', editedTask.value.description);
        formData.append('file', selectedFile.value);

        // Call API to update task with file
        // This would need a proper API endpoint for updating with file
        // await taskStore.updateTaskWithFile(formData);
      } else {
        // Update task without file
        await taskStore.updateTask(editedTask.value.groupId, editedTask.value);
      }

      // Update local task
      emit('update-task', { ...editedTask.value });

      // Reset file selection
      selectedFile.value = null;
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  // Toggle editing state
  isEditing.value = !isEditing.value;
};

// Handle file selection
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

// Task action handlers
const handleDeleteTask = () => {
  if (confirm('Bạn có chắc muốn xóa công việc này không?')) {
    emit('delete-task');
  }
};

// Watch for changes in task prop to reload task details
watch(() => props.task, () => {
  if (isExpanded.value) {
    loadTaskDetails();
  }
});

// Load task file when component mounts
onMounted(async () => {
  // Initialize from store
  const latestTask = storeTask.value;
  if (latestTask) {
    localPercentDone.value = latestTask.percentDone;
    editedTask.value = { ...latestTask };
  }

  // Get current user code from localStorage
  currentUserCode.value = localStorage.getItem('currentUserCode') || '';
  userCode.value = localStorage.getItem('userCode') || '';

  if (isExpanded.value) {
    await loadTaskDetails();
  }
});
</script>

<style scoped>
.task-item-mobile {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.task-item-mobile.expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-header {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.task-basic-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-description {
  font-size: 13px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-indicators {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.percent-badge {
  background-color: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;
}

.deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.days-left {
  font-size: 11px;
  color: #555;
  margin-left: 2px;
  font-style: italic;
}

.expand-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  color: #666;
  transition: transform 0.2s ease;
}

.expanded .expand-icon {
  transform: rotate(180deg);
}

/* Expanded task details */
.task-details {
  padding: 0 16px 16px;
  border-top: 1px solid #eee;
}

.details-section {
  margin-top: 10px;
}

.detail-row {
  margin-bottom: 12px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row strong {
  color: #555;
  font-weight: 500;
}

.detail-row p {
  margin: 0;
  color: #333;
}

.percent-row {
  margin: 15px 0;
}

.percent-slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.percent-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  outline: none;
}

.percent-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #28a745;
  cursor: pointer;
}

.percent-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 40px;
  text-align: right;
}

.updating-text {
  color: #888;
  font-size: 11px;
  display: block;
}

.file-download {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 8px 10px;
  border-radius: 6px;
  margin-top: 5px;
}

.file-download span {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.file-download-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* Comments section */
.comments-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.comments-section h3 {
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #333;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.comment-item {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.comment-display {
  width: 100%;
}

.comment-content {
  flex: 1;
  margin-bottom: 8px;
}

.comment-content p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.comment-user {
  font-size: 12px;
  color: #888;
}

.comment-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  width: 100%;
}

.action-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  text-decoration: underline;
}

.edit-link {
  color: #2196F3;
}

.delete-link {
  color: #f44336;
}

.no-comments {
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 15px 0;
}

.comment-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  background-color: #f5f5f5;
  border-radius: 24px;
  padding: 4px 8px;
  position: relative;
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #666;
  padding: 8px;
  cursor: pointer;
}

.file-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4081;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-input input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  font-size: 14px;
  outline: none;
}

.comment-input button {
  background: none;
  border: none;
  color: #4CAF50;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.comment-input button:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.action-buttons button {
  flex: 1;
  min-width: calc(50% - 5px); /* Half width minus half of the gap */
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.action-buttons button:only-child {
  flex-basis: 100%; /* Take full width if it's the only button */
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.status-btn {
  background-color: #4CAF50;
  color: white;
  flex-basis: 100%; /* This button always takes full width regardless of siblings */
}

.action-buttons button svg {
  margin-right: 6px;
}

.edit-controls {
  display: flex;
  gap: 8px;
  margin-top: 5px;
}

.save-btn, .cancel-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.creator-indicator {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

/* Debug info */
.debug-info {
  font-size: 12px;
  color: #888;
  margin-top: 10px;
  text-align: right;
}

.edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 4px;
}

.edit-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  margin-top: 4px;
}

.file-input {
  width: 100%;
  margin-top: 8px;
}

/* Status selection overlay */
.status-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.status-selector {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
}

.status-selector h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.status-option {
  padding: 12px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  background-color: #f9f9f9;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.status-option:hover {
  background-color: #f0f0f0;
  border-color: #ddd;
}

.status-option.active {
  background-color: #e8f5e9;
  border-color: #28a745;
  color: #28a745;
  font-weight: 600;
}
</style>
