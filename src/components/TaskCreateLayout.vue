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

        <div class="form-group">
          <label>Người được giao (nếu muốn giao riêng cho ai đó):</label>
          <div class="code-input">
            <input
              v-model="newAssignee"
              type="text"
              placeholder="Nhập mã người dùng"
              @keyup.enter="addAssignee"
            />
            <button type="button" class="add-btn" @click="addAssignee">Thêm</button>
          </div>
          <div class="code-list">
            <div
              v-for="(code, index) in form.assigneesUserCodes"
              :key="index"
              class="code-item"
            >
              <span>{{ code }}</span>
              <button type="button" class="remove-btn" @click="removeAssignee(index)">X</button>
            </div>
          </div>
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

const emit = defineEmits(['close', 'submitted']);

const form = ref({
  groupId: '' as string | number,
  userId: '',
  title: '',
  description: '',
  percentDone: 0,
  assigneesUserCodes: [] as string[],
  file: null as File | null,
});

onMounted(() => {
  const savedGroupId = localStorage.getItem('groupId');
  const savedUserCode = localStorage.getItem('userCode');

  if (savedGroupId) form.value.groupId = savedGroupId;
  if (savedUserCode) form.value.userId = savedUserCode;
});

const newAssignee = ref('');

function addAssignee() {
  const trimmed = newAssignee.value.trim();
  if (trimmed && !form.value.assigneesUserCodes.includes(trimmed)) {
    form.value.assigneesUserCodes.push(trimmed);
    newAssignee.value = '';
  }
}

function removeAssignee(index: number) {
  form.value.assigneesUserCodes.splice(index, 1);
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
    formData.append(
      'assigneesUserCode',
      form.value.assigneesUserCodes.map(code => `"${code}"`).join(', ')
    );
    if (form.value.file) {
      formData.append('fileOfTask', form.value.file);
    }

    await createTask(formData);
    alert('Tạo công việc mới thành công');
    emit('submitted');
    emit('close');
  } catch (error: any) {
    console.error('Error submitting task:', error);
    alert(error.message || 'Lỗi khi tạo task');
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
textarea {
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
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.code-item {
  background: #f1f1f1;
  padding: 0.4rem 0.6rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: red;
  font-weight: bold;
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
</style>
