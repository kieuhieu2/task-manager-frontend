<template>
  <div :class="['left-navbar', { 'visible': isVisible }]">
    <div class="buttons-container">
      <button @click="emit('showCreateTask')">
        <Icon icon="circum:square-plus" />
        <span>Thêm mới công việc</span>
      </button>
      <button @click="emit('showCreateGroup')">
        <Icon icon="stash:folder-plus-light" />
        <span>Thêm mới nhóm công việc</span>
      </button>
      <button @click="emit('showSpam')">
        <Icon icon="fluent:archive-20-regular" />
        <span>Hiện thị cột spam</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps({
  isVisible: Boolean
});

const emit = defineEmits(['showCreateTask', 'showCreateGroup', 'showSpam']);
</script>

<style scoped>
.left-navbar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 300px;
  height: calc(100% - 80px);
  background-color: #d8eedd;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  margin-top: 10px;
}

.left-navbar.visible {
  transform: translateX(0);
}

.buttons-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  width: 100%;
}

button {
  width: 90%;
  padding: 10px 8px;
  border: 1px solid #ccc;
  border-radius: 30px;
  background-color: #fff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  white-space: normal;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

button:hover {
  background-color: #e9ecef;
}

</style>

