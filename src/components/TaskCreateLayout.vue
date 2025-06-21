<template>
  <div class="overlay">
    <div class="form-create-task-container">
      <button class="close-btn" @click="$emit('close')">×</button>
      <h3 class="create-task-label">Tạo mới Task</h3>
      <form @submit.prevent="submitTask">
        <div hidden="hidden">
          <label>Mã nhóm: </label>
          <p class="readonly-field">{{ form.groupId }}</p>
        </div>

        <div hidden="hidden">
          <label>Mã người dùng:</label>
          <p class="readonly-field">{{ form.userId }}</p>
        </div>

        <div>
          <label>Tiêu đề:</label>
          <input type="text" v-model="form.title" required />
        </div>

        <div>
          <label>Mô tả:</label>
          <textarea v-model="form.description" required></textarea>
        </div>

        <div>
          <label>Tiến độ (%):</label>
          <input type="number" v-model="form.percentDone" min="0" max="100" required />
        </div>

        <div>
          <label>Loại công việc:</label>
          <select v-model="form.taskType" required>
            <option value="PUBLIC_TASK">Việc chung của nhóm</option>
            <option value="PRIVATE_TASK">Việc riêng cho các cá nhân</option>
          </select>
        </div>

        <div v-if="form.taskType === 'PRIVATE_TASK'" class="form-group">
          <label>Người được giao:</label>
          <div class="code-input">
            <input
              v-model="newAssignee"
              type="text"
              placeholder="Nhập mã người dùng"
              @keydown.enter.prevent="handleEnterAddAssignee"
            />
            <button type="button" class="add-btn" @click="addAssignee">Thêm</button>
          </div>
          <div class="code-list">
            <div
              v-for="(assignee, index) in form.assignees"
              :key="index"
              class="code-item"
            >
              <span>{{ assignee.fullName || 'User not existed' }} ({{ assignee.userCode }})</span>
              <button type="button" class="remove-btn" @click="removeAssignee(index)">×</button>
            </div>
          </div>
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>

        <div>
          <label>Deadline:</label>
          <input type="date" v-model="form.deadline" required />
        </div>

        <div>
          <label>File đính kèm:</label>
          <input type="file" @change="onFileChange" />
        </div>

        <button type="submit">Tạo Công việc</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createTask } from '@/api/task.ts';
import { getFullNameByUserCode } from '@/api/userApi.ts';

const emit = defineEmits(['close', 'submitted']);

const form = ref({
  groupId: '' as string | number,
  userId: '',
  title: '',
  description: '',
  percentDone: 0,
  taskType: 'PUBLIC_TASK',
  assignees: [] as Array<{ userCode: string; fullName: string }>,
  file: null as File | null,
  deadline: '',
});

onMounted(() => {
  const savedGroupId = localStorage.getItem('groupId');
  const savedUserCode = localStorage.getItem('userCode');

  if (savedGroupId) form.value.groupId = savedGroupId;
  if (savedUserCode) form.value.userId = savedUserCode;
});

const newAssignee = ref('');
const error = ref<string | null>(null);

const handleEnterAddAssignee = (event: KeyboardEvent) => {
  event.preventDefault();
  addAssignee();
};

async function addAssignee() {
  const userCode = newAssignee.value.trim();
  if (!userCode) return;

  try {
    const fullName = await getFullNameByUserCode(userCode);
    form.value.assignees.push({ userCode, fullName });
    newAssignee.value = '';
  } catch (err: unknown) {
    const typedError = err as { message?: string };
    error.value = typedError.message || 'Không thể thêm người dùng';
    console.error('Lỗi khi thêm người dùng:', err);
  }
}

function removeAssignee(index: number) {
  form.value.assignees.splice(index, 1);
}

function onFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    form.value.file = files[0];
  }
}

async function submitTask() {
  try {
    const formData = new FormData();
    formData.append('groupId', form.value.groupId.toString());
    formData.append('userCode', form.value.userId);
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('percentDone', String(form.value.percentDone));
    formData.append('taskType', form.value.taskType);

    if (form.value.taskType === 'PRIVATE_TASK' && form.value.assignees.length > 0) {
      form.value.assignees.forEach(assignee => {
        formData.append('assigneesUserCode', assignee.userCode);
      });
    } else if (form.value.taskType === 'PUBLIC_TASK') {
      formData.append('assigneesUserCode', form.value.userId);
    }

    if (form.value.file) {
      formData.append('fileOfTask', form.value.file);
    }

    if (form.value.deadline) {
      formData.append('deadline', form.value.deadline);
    }

    await createTask(formData);
    alert('Tạo công việc mới thành công');
    emit('submitted');
    emit('close');
  } catch (error: unknown) {
    const typedError = error as { message?: string };
    console.error('Error submitting task:', error);
    alert(typedError.message || 'Lỗi khi tạo task');
  }
}
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.form-create-task-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 80vw;
  height: 80vh;
  position: relative;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

form div {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #333;
}

input[type="text"],
input[type="number"],
input[type="file"],
textarea,
select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

button[type="submit"] {
  background-color: #007bff;
  color: white;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  align-self: flex-start;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

.code-input {
  display: flex;
  gap: 0.5rem;
}

.code-input input {
  flex: 1;
}

.code-list {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.code-item {
  background: #e9ecef;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: row;
}

.code-item span {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-size: 0.95rem;
  color: #212529;
}

.remove-btn {
  background: #dc3545;
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #c82333;
  }
}

.readonly-field {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
  margin-top: 4px;
}

.create-task-label {
  text-align: center;
  font-size: 25px;
  margin: 0 auto;
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #218838;
  }
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 10px;
}
</style>
