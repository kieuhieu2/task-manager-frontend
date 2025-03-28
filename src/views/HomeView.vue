<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogin = () => {
  router.push('/login');
};

const handleClickLogo = () => {
  router.push('/');
};

</script>

<template>
  <div class="home-view-container">
    <header class="home-view-header">
      <h1 class="header-p" @click="handleClickLogo">Quản lý công việc</h1>
      <button class="btn-login" @click="handleLogin">Đăng nhập</button>
    </header>
    <main>
      <h1 class="h1"> Đây là trang chủ sẽ có các thông báo khi chưa đăng nhập hoặc lâần đầu truy cập trang web</h1>
    </main>
  </div>
</template>

<style scoped>
.home-view-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.home-view-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  width: 100%;
  background-color: #f5f5f5;
  justify-content: space-between;
}

.h1 {
  margin-top: 200px;
}

.btn-login {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.header-p {
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

</style>
