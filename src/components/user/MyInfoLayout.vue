<template>
  <div class="modal-overlay">
    <div class="my-info-layout">
      <div class="header">
        <h2>Thông tin cá nhân</h2>
        <button class="close-btn" @click="emit('close')">[x]</button>
      </div>

      <div class="avatar-container">
        <div class="avatar" @click="handleAvatarClick">
          <img :src="avatarUrl" alt="Avatar" />
          <div v-if="showAvatarUpload" class="avatar-upload-overlay">
            <label for="avatar-upload" class="upload-button" @click="triggerFileInput">Đổi ảnh</label>
            <input
              type="file"
              id="avatar-upload"
              ref="fileInput"
              accept="image/*"
              @change="handleAvatarChange"
              style="display: none"
            />
          </div>
        </div>
        <div v-if="isUploading" class="upload-status">
          Đang tải ảnh lên...
        </div>
      </div>

      <div v-if="loading" class="loading">
        <p>Đang tải thông tin người dùng...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="user" class="user-details">
        <template v-if="!isEditing">
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
                <td class="value">{{ user.code || '-' }}</td>
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

          <div class="actions">
            <button @click="isEditing = true">Sửa thông tin</button>
          </div>
        </template>

        <template v-else>
          <form @submit.prevent="submitUpdate">
            <div>
              <label>Họ:</label>
              <input v-model="form.firstName" type="text" required />
            </div>
            <div>
              <label>Tên:</label>
              <input v-model="form.lastName" type="text" required />
            </div>
            <div>
              <label>Ngày sinh:</label>
              <input v-model="form.dob" type="date" required />
            </div>
            <div class="handleSaveBtn">
              <button type="submit">Lưu</button>
              <button type="button" @click="cancelEdit">Hủy</button>
            </div>
          </form>
        </template>
      </div>

      <div v-else class="not-found">
        <p>Không tìm thấy thông tin người dùng</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyInfo, getMyAvatar, updateUserAvatar } from '@/api/userApi'
import type { User } from '@/types/user'
import { updateMyInfo } from '@/api/userApi'

const emit = defineEmits(['close'])
const isEditing = ref(false)
const user = ref<User | null>(null)
const form = ref({ firstName: '', lastName: '', dob: '' })
const error = ref('')
const loading = ref(true)
const avatarUrl = ref('/avatar.jpeg')
const showAvatarUpload = ref(false)
const selectedAvatar = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const getRoleNames = (roles: Array<{ name: string; description: string; permissions: string[] }>): string => {
  return roles.map(role => role.name).join(', ');
};

interface ErrorWithMessage {
  message?: string;
}

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const data = await getMyInfo()
    user.value = data
    form.value = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob
    }
    error.value = ''

    // Try to fetch avatar
    try {
      if (data.code) {
        const avatarData = await getMyAvatar(data.code)
        if (avatarData) {
          avatarUrl.value = avatarData
        }
      }
    } catch (avatarErr) {
      console.warn('Could not load avatar, using default', avatarErr)
      // Keep using default avatar
    }
  } catch (err: unknown) {
    const error_obj = err as ErrorWithMessage
    error.value = error_obj?.message || 'Không thể tải thông tin người dùng'
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  if (user.value) {
    form.value = {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      dob: user.value.dob
    }
  }
  isEditing.value = false
}

const submitUpdate = async () => {
  try {
    const formData = new FormData()
    formData.append('firstName', form.value.firstName)
    formData.append('lastName', form.value.lastName)
    formData.append('dob', form.value.dob)

    await updateMyInfo(formData)

    // Cập nhật lại user để hiển thị mới
    user.value = {
      ...(user.value as User),
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      dob: form.value.dob
    }

    isEditing.value = false
    error.value = ''
  } catch (err: unknown) {
    const error_obj = err as ErrorWithMessage
    error.value = error_obj?.message || 'Cập nhật thất bại'
  }
}

const handleAvatarClick = () => {
  showAvatarUpload.value = !showAvatarUpload.value
}

const triggerFileInput = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedAvatar.value = target.files[0]
    // Preview the selected image
    avatarUrl.value = URL.createObjectURL(target.files[0])

    // Auto upload
    await uploadAvatar()
  }
}

const uploadAvatar = async () => {
  if (!selectedAvatar.value || !user.value?.code) return

  isUploading.value = true
  try {
    await updateUserAvatar(user.value.code, selectedAvatar.value)
    // Refresh avatar after successful upload
    if (user.value.code) {
      const newAvatarUrl = await getMyAvatar(user.value.code)
      avatarUrl.value = newAvatarUrl
    }
    showAvatarUpload.value = false
    selectedAvatar.value = null
  } catch (err: unknown) {
    const error_obj = err as ErrorWithMessage
    error.value = error_obj?.message || 'Không thể cập nhật ảnh đại diện'
  } finally {
    isUploading.value = false
  }
}

onMounted(fetchUserInfo)
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

.my-info-layout {
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
  position: relative;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}

.avatar:hover .avatar-upload-overlay {
  opacity: 1;
}

.upload-button {
  background-color: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 4px 0;
  font-size: 12px;
  border: none;
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

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.actions button {
  background-color: #3498db;
  color: white;
  padding: 8px 20px;
}

.actions button:hover {
  background-color: #2980b9;
}

/* Form styles */
form div {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

form label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

form input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

form input:focus {
  border-color: #3498db;
  outline: none;
}

/* Buttons in the form */
.handleSaveBtn {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
  border-bottom: none;
}

.handleSaveBtn button[type="submit"] {
  background-color: #2ecc71;
  color: white;
}

.handleSaveBtn button[type="submit"]:hover {
  background-color: #27ae60;
}

.handleSaveBtn button[type="button"] {
  background-color: #e74c3c;
  color: white;
}

.handleSaveBtn button[type="button"]:hover {
  background-color: #c0392b;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.upload-status {
  margin-top: 10px;
  text-align: center;
  color: #3498db;
  font-size: 14px;
}
</style>
