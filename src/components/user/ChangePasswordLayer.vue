<script setup lang="ts">
import { ref, computed } from 'vue';
import { requestPasswordReset, changePassword } from '@/api/auth.js';
import axios from 'axios';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const otpCode = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const message = ref('');
const isError = ref(false);
const isOtpSent = ref(false);

const isFormValid = computed(() => {
  return otpCode.value &&
         oldPassword.value &&
         newPassword.value &&
         confirmPassword.value === newPassword.value;
});

const passwordsMatch = computed(() => {
  return !confirmPassword.value || confirmPassword.value === newPassword.value;
});

async function getOtpCode() {
  isLoading.value = true;
  isError.value = false;
  message.value = '';

  try {
    const response = await requestPasswordReset();
    message.value = response?.message || 'Mã OTP đã được gửi đến email của bạn';
    isOtpSent.value = true;
  } catch (error: unknown) {
    isError.value = true;

    if (axios.isAxiosError(error) && error.response) {
      // If we received a response from the server with an error message
      if (error.response.status !== 500) {
        // For client errors (400, 401, etc.) show the API error message
        message.value = error.response.data?.message || 'Yêu cầu không hợp lệ';
      } else {
        // For server errors (500) show generic message
        message.value = 'Lỗi máy chủ, vui lòng thử lại sau';
      }
    } else if (error instanceof Error) {
      message.value = error.message;
    } else {
      message.value = 'Không thể gửi mã OTP';
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleChangePassword() {
  if (!isFormValid.value) {
    isError.value = true;
    message.value = 'Vui lòng điền đầy đủ thông tin và đảm bảo mật khẩu khớp nhau';
    return;
  }

  isLoading.value = true;
  isError.value = false;
  message.value = '';

  try {
    const response = await changePassword(oldPassword.value, otpCode.value, newPassword.value);
    message.value = response?.message || 'Mật khẩu đã được thay đổi thành công';
    resetForm();

    setTimeout(() => {
      emit('close');
    }, 2000);
  } catch (error: unknown) {
    isError.value = true;

    if (axios.isAxiosError(error) && error.response) {
      // If we received a response from the server with an error message
      if (error.response.status !== 500) {
        // For client errors (400, 401, etc.) show the API error message
        message.value = error.response.data?.message || 'Yêu cầu không hợp lệ';
      } else {
        // For server errors (500) show generic message
        message.value = 'Lỗi máy chủ, vui lòng thử lại sau';
      }
    } else if (error instanceof Error) {
      message.value = error.message;
    } else {
      message.value = 'Không thể thay đổi mật khẩu';
    }
  } finally {
    isLoading.value = false;
  }
}

function resetForm() {
  otpCode.value = '';
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  isOtpSent.value = false;
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <div class="change-password-layer">
    <div class="header">
      <h2>Đổi mật khẩu</h2>
      <button class="close-button" @click="handleClose">[x]</button>
    </div>

    <div v-if="message" class="message" :class="{ error: isError }">
      {{ message }}
    </div>

    <div class="form-container">
      <div class="form-group otp-group">
        <label for="otpCode">Mã OTP:</label>
        <div class="otp-input-group">
          <input
            id="otpCode"
            v-model="otpCode"
            type="text"
            placeholder="Nhập mã OTP"
            :disabled="isLoading"
          />
          <button
            @click="getOtpCode"
            :disabled="isLoading"
            class="otp-button"
          >
            {{ isOtpSent ? 'Gửi lại OTP' : 'Lấy mã OTP' }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="oldPassword">Mật khẩu cũ:</label>
        <input
          id="oldPassword"
          v-model="oldPassword"
          type="password"
          placeholder="Nhập mật khẩu cũ"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="newPassword">Mật khẩu mới:</label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          placeholder="Nhập mật khẩu mới"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Xác nhận mật khẩu:</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          :disabled="isLoading"
        />
        <span v-if="!passwordsMatch" class="error-text">Mật khẩu không khớp</span>
      </div>

      <div class="button-group">
        <button
          @click="handleChangePassword"
          :disabled="!isFormValid || isLoading"
          class="change-button"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.change-password-layer {
  width: 30vw;
  height: 60vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      color: #333;
      margin: 0;
    }

    .close-button {
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;

      &:hover {
        color: #333;
      }
    }
  }

  .message {
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
    background-color: #e6f7e6;
    color: #2e7d32;
    text-align: center;

    &.error {
      background-color: #ffebee;
      color: #c62828;
    }
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;

    label {
      font-weight: 500;
      color: #555;
    }

    input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
      }
    }

    &.otp-group {
      .otp-input-group {
        display: flex;
        gap: 10px;

        input {
          flex: 1;
        }

        .otp-button {
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0 15px;
          cursor: pointer;
          white-space: nowrap;

          &:hover {
            background-color: #1976d2;
          }

          &:disabled {
            background-color: #bbdefb;
            cursor: not-allowed;
          }
        }
      }
    }

    .error-text {
      font-size: 12px;
      color: #c62828;
      margin-top: 4px;
    }
  }

  .button-group {
    margin-top: 10px;
    display: flex;
    justify-content: center;

    .change-button {
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        background-color: #388e3c;
      }

      &:disabled {
        background-color: #c8e6c9;
        cursor: not-allowed;
      }
    }
  }
}
</style>
