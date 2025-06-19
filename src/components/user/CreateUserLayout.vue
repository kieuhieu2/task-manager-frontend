<template>
  <div class="modal-overlay">
    <div class="create-user-layout">
      <div class="header">
        <h2>Tạo mới người dùng</h2>
        <button class="close-btn" @click="$emit('close')">[x]</button>
      </div>

      <div class="form-container">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">Tài khoản</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              placeholder="Nhập tên tài khoản"
            />
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Họ</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                required
                placeholder="Nhập họ"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Tên</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                required
                placeholder="Nhập tên"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="code">Mã người dùng</label>
              <input
                id="code"
                v-model="formData.code"
                type="text"
                required
                placeholder="Nhập mã người dùng"
              />
            </div>

            <div class="form-group">
              <label for="dob">Ngày sinh</label>
              <input
                id="dob"
                v-model="formData.dob"
                type="date"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="role">Vai trò</label>
            <select id="role" v-model="formData.role" required>
              <option value="">-- Chọn vai trò --</option>
              <option value="ADMIN">Admin</option>
              <option value="LECTURER">Giảng viên</option>
              <option value="STUDENT">Sinh viên</option>
              <option value="COLLABORATOR">Cộng tác viên</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="create-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Đang tạo...' : 'Tạo mới' }}
            </button>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createUser } from '@/api/userApi';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void;
}>();

const formData = ref({
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  code: '',
  role: '',
  dob: ''
});

const isSubmitting = ref(false);
const error = ref('');

const handleSubmit = async () => {
  isSubmitting.value = true;
  error.value = '';

  try {
    // Tạo FormData object
    const formDataObj = new FormData();
    formDataObj.append('username', formData.value.username);
    formDataObj.append('password', formData.value.password);
    formDataObj.append('firstName', formData.value.firstName);
    formDataObj.append('lastName', formData.value.lastName);
    formDataObj.append('code', formData.value.code);
    formDataObj.append('role', formData.value.role);
    formDataObj.append('dob', formData.value.dob);

    // Gọi API tạo người dùng
    await createUser(formDataObj);

    // Thông báo thành công
    alert('Tạo người dùng thành công!');

    // Đóng form và thông báo cho component cha rằng đã tạo thành công
    emit('created');
    emit('close');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo người dùng';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.create-user-layout {
  width: 60vw;
  height: 70vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  position: relative;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: red;
}

.form-container {
  padding: 0 1rem;
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.create-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.create-btn:hover {
  background-color: #218838;
}

.create-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  margin-top: 1rem;
  text-align: center;
}
</style>
