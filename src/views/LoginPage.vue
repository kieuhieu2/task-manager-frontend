<template>
  <div class="login-container">
    <form @submit.prevent="login" v-if="!showForgotPassword">
      <h3>Quản lý công việc</h3>

      <label for="username">Tài khoản</label>
      <input
        type="text"
        placeholder="Email"
        id="username"
        v-model="form.username"
      />

      <label for="password">Mật Khẩu</label>
      <input
        type="password"
        placeholder="Mật khẩu"
        id="password"
        v-model="form.password"
      />

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Đăng nhập' }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>

      <div class="forgot-password-container">
        <button
          class="forgot-password-btn"
          type="button"
          @click="toggleForgotPassword"
        >
          Quên mật khẩu
        </button>
      </div>
    </form>

    <!-- Forgot Password Step 1: Enter username to check if exists -->
    <form @submit.prevent="requestOTP" v-else-if="showForgotPassword && !showOTPInput">
      <h3>Quên mật khẩu</h3>

      <p class="instruction-text">Vui lòng nhập tên đăng nhập để lấy lại mật khẩu</p>

      <label for="userCode">Tài khoản</label>
      <input
        type="text"
        placeholder="Nhập tên đăng nhập"
        id="userCode"
        v-model="usernameInput"
      />

      <button type="submit" :disabled="isRequestingOTP">
        {{ isRequestingOTP ? 'Đang kiểm tra...' : 'Tiếp tục' }}
      </button>

      <p v-if="forgotPasswordError" class="error-message">{{ forgotPasswordError }}</p>

      <div class="forgot-password-container">
        <button
          class="back-btn"
          type="button"
          @click="toggleForgotPassword"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </form>

    <!-- Forgot Password Step 2: Enter OTP and new password -->
    <form @submit.prevent="resetPassword" v-else>
      <h3>Đặt lại mật khẩu</h3>

      <p class="success-message">Tài khoản hợp lệ. Mã OTP đã được gửi.</p>

      <label for="otpCode">Mã OTP</label>
      <input
        type="text"
        placeholder="Nhập mã OTP"
        id="otpCode"
        v-model="forgotPasswordForm.otpCode"
      />

      <label for="newPassword">Mật khẩu mới</label>
      <input
        type="password"
        placeholder="Nhập mật khẩu mới"
        id="newPassword"
        v-model="forgotPasswordForm.newPassword"
      />

      <button type="submit" :disabled="isResettingPassword">
        {{ isResettingPassword ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}
      </button>

      <p v-if="forgotPasswordError" class="error-message">{{ forgotPasswordError }}</p>

      <div class="forgot-password-container">
        <button
          class="back-btn"
          type="button"
          @click="showOTPInput = false"
        >
          Quay lại
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useLogin } from '@/composables/useLogin.js'
import axios from 'axios'

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const { form, isLoading, error, login } = useLogin();
    const showForgotPassword = ref(false);
    const showOTPInput = ref(false);
    const isRequestingOTP = ref(false);
    const isResettingPassword = ref(false);
    const forgotPasswordError = ref('');
    const usernameInput = ref('');

    const forgotPasswordForm = ref({
      userCode: '',
      otpCode: '',
      newPassword: ''
    });

    const toggleForgotPassword = () => {
      showForgotPassword.value = !showForgotPassword.value;
      showOTPInput.value = false;
      forgotPasswordError.value = '';
      usernameInput.value = '';
      forgotPasswordForm.value = {
        userCode: '',
        otpCode: '',
        newPassword: ''
      };
    };

    const requestOTP = async () => {
      if (!usernameInput.value) {
        forgotPasswordError.value = 'Vui lòng nhập tên đăng nhập';
        return;
      }

      // Prevent double submission
      if (isRequestingOTP.value) {
        return;
      }

      try {
        isRequestingOTP.value = true;
        forgotPasswordError.value = '';

        const checkUserResponse = await axios.get(`http://localhost:8080/users/check/${usernameInput.value}`);

        if (checkUserResponse.data.code === 1000) {
          forgotPasswordForm.value.userCode = checkUserResponse.data.result;

          showOTPInput.value = true;
        } else {
          forgotPasswordError.value = 'Tên đăng nhập không tồn tại';
        }

        try {
          await axios.post('http://localhost:8080/auth/password-reset-request', {
            userCode: forgotPasswordForm.value.userCode
          });
        } catch (error) {
          console.log(error);
        }

      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        forgotPasswordError.value = error.response?.data?.message || 'Tên đăng nhập không tồn tại hoặc có lỗi xảy ra';
      } finally {
        isRequestingOTP.value = false;
      }
    };

    const resetPassword = async () => {
      if (!forgotPasswordForm.value.otpCode || !forgotPasswordForm.value.newPassword) {
        forgotPasswordError.value = 'Vui lòng nhập đầy đủ thông tin';
        return;
      }

      try {
        isResettingPassword.value = true;
        forgotPasswordError.value = '';

        await axios.post('http://localhost:8080/auth/forget-password', {
          userCode: forgotPasswordForm.value.userCode,
          otpCode: forgotPasswordForm.value.otpCode,
          newPassword: forgotPasswordForm.value.newPassword
        });

        toggleForgotPassword();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        forgotPasswordError.value = error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
      } finally {
        isResettingPassword.value = false;
      }
    };

    return {
      form,
      isLoading,
      error,
      login,
      showForgotPassword,
      showOTPInput,
      usernameInput,
      forgotPasswordForm,
      forgotPasswordError,
      isRequestingOTP,
      isResettingPassword,
      toggleForgotPassword,
      requestOTP,
      resetPassword
    };
  },
});

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand&display=swap');

*,
:before,
:after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: inherit;
}

.login-container {
  height: 100vh;
  width: 100vw;
  background-image: url('https://raw.githubusercontent.com/CiurescuP/LogIn-Form/main/bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

form {
  height: 590px;
  width: 450px;
  background-color: rgba(255, 255, 255, 0.13);
  border-radius: 17px;
  //backdrop-filter: blur(5px);
  border: 5px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(129, 236, 174, 0.6);
  padding: 20px;
}

form * {
  font-family: 'Quicksand', sans-serif;
  color: #ffffff;
  letter-spacing: 1px;
  outline: none;
  border: none;
}

form h3 {
  font-size: 40px;
  font-weight: 600;
  line-height: 50px;
  text-align: center;
}

label {
  display: block;
  margin-top: 30px;
  font-size: 25px;
  font-weight: 800;
}

input {
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 11px 15px;
  font-size: 14px;
  font-weight: 300;
  background: rgba(0, 0, 0, 0.22);
  border: 2px solid #38363654;
  border-radius: 5px;
  width: 100%;

  &:hover {
    background: #434343;
    transition: all 0.5s ease;
  }

  &:focus {
    box-shadow: 2px 2px rgba(0, 0, 0, 0.17), 5px 10px rgba(0, 0, 0, 0.21);
    background: #434343;
  }

  &::placeholder {
    color: #e5e5e5;
  }
}

button {
  margin-top: 40px;
  margin-bottom: 15px;
  width: 100%;
  background: rgba(0, 0, 0, 0.22);
  border: 2px solid #38363654;
  border-radius: 5px;
  color: #e1e1e1;
  padding: 8px 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #629677;
    transition: all 0.5s ease;
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(103, 110, 103, 0.71);
    background: #629677;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.forgot-password-container {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.forgot-password-btn, .back-btn {
  min-height: 40px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  max-width: 200px;
  max-height: 40px;
  border-radius: 40px;
  box-shadow: 0 4px 8px rgba(12, 11, 11, 0);
  transition: all 0.5s ease;
  font-size: 16px;

  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.48);
  }

  &:focus {
    box-shadow: 0 0 0 2px currentColor;
    transform: scale(0.9);
  }
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 10px;
  font-weight: 500;
}

.instruction-text {
  text-align: center;
  margin: 15px 0;
  font-size: 16px;
  color: #e1e1e1;
}

.success-message {
  text-align: center;
  margin: 15px 0;
  font-size: 16px;
  color: #81ECAE;
  font-weight: 600;
}
</style>
