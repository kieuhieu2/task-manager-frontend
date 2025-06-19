<template>
  <div class="modal-overlay">
    <div class="my-info-layout">
      <button class="close-button" @click="emitClose">[x]</button>
      <h2>Thông tin người dùng</h2>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-else-if="!user">Đang tải dữ liệu người dùng...</p>

      <div v-else>
        <template v-if="!isEditing">
          <p><strong>Họ tên:</strong> {{ user.firstName }} {{ user.lastName }}</p>
          <p><strong>Tên đăng nhập:</strong> {{ user.username }}</p>
          <p><strong>Ngày sinh:</strong> {{ user.dob }}</p>
          <p><strong>Vai trò:</strong> {{ user.roles[0]?.name || 'Không có vai trò' }}</p>

          <button @click="isEditing = true">Sửa thông tin</button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { defineEmits } from 'vue'
import { getMyInfo } from '@/api/userApi.js'
import type { User } from '@/types/user'
const emit = defineEmits(['close'])
const emitClose = () => emit('close')
const isEditing = ref(false)
const user = ref<User | null>(null)
const form = ref({ firstName: '', lastName: '', dob: '' })
const error = ref('')

const fetchUserInfo = async () => {
  try {
    const data = await getMyInfo()
    user.value = data
    form.value = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob
    }
    error.value = ''
  } catch (err: any) {
    error.value = err?.message || 'Không thể tải thông tin người dùng'
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

    // Gọi hàm xử lý cập nhật (do bạn sẽ định nghĩa sau)
    await handleUpdateUser(formData)

    // Cập nhật lại user để hiển thị mới
    user.value = {
      ...(user.value as User),
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      dob: form.value.dob
    }

    isEditing.value = false
    error.value = ''
  } catch (err: any) {
    error.value = err?.message || 'Cập nhật thất bại'
  }
}

// 👉 Bạn sẽ viết hàm này ở nơi khác, ví dụ truyền từ cha vào hoặc import từ service
const handleUpdateUser = async (formData: FormData) => {
  // Placeholder: bạn sẽ định nghĩa sau
  console.warn('handleUpdateUser chưa được định nghĩa.')
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
  background-color: rgba(0, 0, 0, 0.5); /* nền mờ */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* đảm bảo đè lên tất cả */
}

.my-info-layout {
  position: relative;
  background: #fff;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 10000;
  animation: fadeIn 0.2s ease-in-out;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.error {
  color: red;
}

input {
  display: block;
  width: 100%;
  padding: 6px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Nút Sửa */
.my-info-layout button:not(.close-button):not([type="submit"]):not([type="button"]) {
  background-color: #3498db;
  color: white;
}

.my-info-layout button:not(.close-button):not([type="submit"]):not([type="button"]):hover {
  background-color: #2980b9;
}

/* Nút Lưu */
.my-info-layout button[type="submit"] {
  background-color: #2ecc71;
  color: white;
}

.my-info-layout button[type="submit"]:hover {
  background-color: #27ae60;
}

/* Nút Hủy */
.my-info-layout button[type="button"] {
  background-color: #e74c3c;
  color: white;
}

.my-info-layout button[type="button"]:hover {
  background-color: #c0392b;
}

/* Nút Đóng [x] */
.close-button {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #333;
}

/* Căn chỉnh từng nhóm label + input */
form div {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

/* Label hiển thị rõ ràng */
form label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

/* Input có viền và bo góc đẹp hơn */
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

.handleSaveBtn {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

</style>
