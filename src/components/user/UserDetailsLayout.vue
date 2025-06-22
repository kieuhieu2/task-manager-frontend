<template>
  <div class="modal-overlay">
    <div class="user-details-layout">
      <div class="header">
        <h2>Chi tiết người dùng</h2>
        <button class="close-btn" @click="$emit('close')">[x]</button>
      </div>

      <div class="avatar-container">
        <div class="avatar">
          <img :src="avatarUrl" alt="Avatar" />
        </div>
      </div>

      <div v-if="loading" class="loading">
        <p>Đang tải thông tin người dùng...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="user" class="user-details">
        <table>
          <tbody>
            <tr>
              <td class="label">Tài khoản</td>
              <td class="value">{{ user.username }}</td>
            </tr>
            <tr>
              <td class="label">Họ</td>
              <td class="value">{{ user.firstName || '-' }}</td>
            </tr>
            <tr>
              <td class="label">Tên</td>
              <td class="value">{{ user.lastName || '-' }}</td>
            </tr>
            <tr>
              <td class="label">Mã người dùng</td>
              <td class="value">{{ user.code }}</td>
            </tr>
            <tr>
              <td class="label">Ngày sinh</td>
              <td class="value">{{ user.dob || '-' }}</td>
            </tr>
            <tr>
              <td class="label">Vai trò</td>
              <td class="value">{{ getRoleNames(user.roles) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="not-found">
        <p>Không tìm thấy thông tin người dùng</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserByCode, getMyAvatar } from '@/api/userApi';

interface Role {
  name: string;
  description: string;
  permissions: string[];
}

interface User {
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  code: string;
  dob: string | null;
  roles: Role[];
}

interface ErrorWithMessage {
  message?: string;
}

const props = defineProps<{
  userCode: string;
}>();

const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const avatarUrl = ref('/avatar.jpeg');

const getRoleNames = (roles: Role[]): string => {
  return roles.map(role => role.name).join(', ');
};

const fetchUserDetails = async () => {
  if (!props.userCode) {
    error.value = 'Vui lòng nhập mã người dùng';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result = await getUserByCode(props.userCode);
    if (result) {
      user.value = result;

      // Try to fetch avatar
      try {
        const avatarData = await getMyAvatar(result.code);
        if (avatarData) {
          avatarUrl.value = avatarData;
        }
      } catch (avatarErr) {
        console.warn('Could not load avatar, using default', avatarErr);
        // Keep using default avatar
      }
    } else {
      error.value = 'Không tìm thấy người dùng';
    }
  } catch (err: unknown) {
    const error_obj = err as ErrorWithMessage;
    error.value = error_obj?.message || 'Không thể lấy thông tin người dùng';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserDetails();
});
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

.user-details-layout {
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
  margin-bottom: 1rem;
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

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #3498db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading,
.error,
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 200px);
}

.error {
  color: #e53e3e;
}

.user-details {
  padding: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table tr {
  border-bottom: 1px solid #edf2f7;
  transition: background-color 0.2s ease;
}

table tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

table tr:last-child {
  border-bottom: none;
}

table td {
  padding: 0.75rem 0.5rem;
}

.label {
  font-weight: 600;
  width: 40%;
  color: #4a5568;
}

.value {
  width: 60%;
}
</style>
