<template>
  <div>
    <div class="mobile-footer">
      <div class="footer-icon" @click="goToHome">
        <Icon icon="lucide:home" width="24" height="24" />
      </div>
      <div class="footer-icon" @click="goToGroupList">
        <Icon icon="lucide:users" width="24" height="24" />
      </div>
      <div class="footer-icon" @click.stop="toggleNotifications">
        <Icon icon="lucide:bell" width="24" height="24" />
        <span v-if="unreadNotificationsCount > 0" class="notification-badge">{{ unreadNotificationsCount }}</span>
      </div>
      <div class="footer-icon"
           @click.stop="handleMenuClick"
           @touchstart="startLongPress"
           @touchend="endLongPress">
        <Icon icon="lucide:menu" width="24" height="24" />
      </div>
    </div>

    <!-- Notification overlay -->
    <NotificationOverlay
      v-if="showNotifications"
      :visible="showNotifications"
      @close="showNotifications = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter, useRoute } from 'vue-router';
import NotificationOverlay from './NotificationOverlay.vue';
import { useNotificationStore } from '@/stores/notificationStore.js';

// Make it a different name to avoid conflicts with our computed property
defineProps<{
  externalUnreadCount?: number;  // Optional prop for backward compatibility
}>();

// Emit menu toggle event since this would still be handled by parent components
const emit = defineEmits<{
  (e: 'menu-click'): void;
  (e: 'long-press'): void;
}>();

const router = useRouter();
const route = useRoute();
const notificationStore = useNotificationStore();
const longPressTimer = ref<number | null>(null);
const activeTab = ref('');
const showNotifications = ref(false);

// Calculate unread notifications directly from store
const unreadNotificationsCount = computed(() => {
  return notificationStore.notifications.filter(n => !n.wasRead).length;
});

// Navigation functions
const goToHome = () => {
  const groupId = localStorage.getItem('groupId');

  if (groupId) {
    // If there's a groupId in localStorage, go to task manager for that group
    if (route.path === `/task-manager/${groupId}`) return; // Already on this page
    router.push(`/task-manager/${groupId}`);
  } else {
    // If no groupId, just go to home page
    if (route.path === '/') return;
    router.push('/');
  }
};

const goToGroupList = () => {
  if (route.path === '/get-my-groups') return;
  router.push('/get-my-groups');
};

// Show notification overlay instead of navigating
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const handleMenuClick = () => {
  emit('menu-click');
};

const startLongPress = () => {
  longPressTimer.value = setTimeout(() => {
    emit('long-press');
  }, 1000) as unknown as number;
};

const endLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
};

onMounted(() => {
  // Check current route to set active tab
  if (route.path.includes('/task-manager')) {
    // Default to todo tab if in task manager
    activeTab.value = 'todo';
  }
});
</script>

<style scoped>
/* Footer section */
.mobile-footer {
  height: 7vh;
  min-height: 7vh;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 30;
}

.footer-icon {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  z-index: 20;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  transition: color 0.2s;
  color: #17bf3b;
}

.footer-icon:hover, .footer-icon.active {
  color: #17bf3b;
}

.footer-icon .notification-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}
</style>
