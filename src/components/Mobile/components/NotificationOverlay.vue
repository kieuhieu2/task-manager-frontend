<template>
  <div class="notification-overlay" @click.self="$emit('close')">
    <div class="notification-panel">
      <div class="notification-header">
        <h3>Thông báo</h3>
        <button class="close-button" @click="$emit('close')">
          <Icon icon="lucide:x" width="20" height="20" />
        </button>
      </div>

      <div class="notification-content">
        <div v-if="loading" class="loading-notifications">
          <p>Đang tải thông báo...</p>
        </div>
        <div v-else-if="error" class="error-notifications">
          <p>{{ error }}</p>
        </div>
        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.notificationId"
            class="notification-item"
            :class="{ 'unread': !notification.wasRead }"
            @click="markAsRead(notification.notificationId)"
          >
            <div class="notification-item-content">
              <p>{{ notification.message }}</p>
              <div class="notification-time">{{ formatNotificationTime(notification.createdAt) }}</div>
            </div>
            <div class="notification-status">
              <div v-if="!notification.wasRead" class="unread-dot"></div>
            </div>
          </div>
          <div v-if="notifications.length === 0" class="empty-notifications">
            <p>Không có thông báo nào</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { Icon } from '@iconify/vue';

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const notificationStore = useNotificationStore();
const loading = computed(() => notificationStore.loading);
const error = computed(() => notificationStore.error);
const notifications = computed(() => notificationStore.notifications);

const markAsRead = async (notificationId: number) => {
  await notificationStore.markAsRead(notificationId);
};

const formatNotificationTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();

    // Nếu thông báo được tạo trong ngày hôm nay
    if (date.toDateString() === now.toDateString()) {
      return `Hôm nay ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // Nếu thông báo được tạo trong ngày hôm qua
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hôm qua ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting notification time:', error);
    return timestamp;
  }
};
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.notification-panel {
  width: 90%;
  max-width: 500px;
  height: 70%;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.notification-header {
  padding: 15px 20px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 15px;
}

.notification-item {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item.unread {
  background-color: #f0f8ff;
}

.notification-item-content {
  flex: 1;
}

.notification-item-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #888;
}

.notification-status {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.unread-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e74c3c;
}

.empty-notifications, .loading-notifications, .error-notifications {
  text-align: center;
  padding: 20px;
  color: #666;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
