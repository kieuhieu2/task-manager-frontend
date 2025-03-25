<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
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

      <div class="social-icons">
        <button class="social-icon fb" type="button">
          <i class="fa-brands fa-facebook"></i>
        </button>
        <button class="social-icon tw" type="button">
          <i class="fa-brands fa-twitter"></i>
        </button>
        <button class="social-icon in" type="button">
          <i class="fa-brands fa-instagram"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLogin } from '@/views/Auth/useLoginPage.js';

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const { form, isLoading, error, handleLogin } = useLogin();

    return {
      form,
      isLoading,
      error,
      handleLogin,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './login.module.scss';
</style>
