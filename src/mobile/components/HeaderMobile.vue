<template>
  <!-- Header section with welcome content -->
  <div class="mobile-header">
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>Hi, {{ userStore.getFullName }} <span class="wave-emoji">👋</span></h2>
        <p>Welcome back!</p>
      </div>
      <div class="avatar-container">
        <img :src="userStore.getAvatar || '/avatar.jpeg'" alt="Avatar" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore.js';

const userStore = useUserStore();
</script>

<style scoped>
/* Header section with app title and user info */
.mobile-header {
  background-color: #bff0ca;
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2px;
  margin-top: 2px;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-text h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wave-emoji {
  display: inline-block;
  animation: wave 1s infinite;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-20deg); }
  100% { transform: rotate(0deg); }
}
</style>
