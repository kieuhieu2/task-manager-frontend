<template>
  <div class="mobile-task-container">
    <!-- Use the extracted HeaderMobile component -->
    <HeaderMobile />

    <!-- mobile menu overlay -->
    <div v-if="menuVisible" class="mobile-menu-overlay" @click="closeMenu">
      <div class="mobile-menu-panel" @click.stop>
        <div class="close-button" @click="closeMenu">
          <Icon icon="lucide:x" width="24" height="24" />
        </div>
        <div class="mobile-menu-header">
          <div class="user-info">
            <div class="user-avatar">
              <img :src="userStore.getAvatar || '/avatar.jpeg'" alt="Avatar" />
            </div>
            <div class="user-details">
              <div class="user-greeting">
                <div>Hi, {{ userStore.getFullName || userName }}</div>
                <div>Welcome back!</div>
              </div>
            </div>
          </div>
        </div>
        <div class="mobile-menu-items">
          <div class="menu-item" @click="goToGroupList">
            <Icon icon="lucide:list" width="24" height="24" />
            <span>Danh sách nhóm</span>
          </div>
          <div class="menu-item" @click="handleMyInfo">
            <Icon icon="lucide:user" width="24" height="24" />
            <span>Thông tin cá nhân</span>
          </div>
          <div class="menu-item" v-if="canHandleGroup" @click="createGroup">
            <Icon icon="lucide:folder-plus" width="24" height="24" />
            <span>Tạo nhóm công việc mới</span>
          </div>
          <div class="menu-item" v-if="canCreateTask" @click="openCreateTask">
            <Icon icon="lucide:file-plus" width="24" height="24" />
            <span>Thêm mới công việc</span>
          </div>
          <div class="menu-item" @click="handleOpenTrash">
            <Icon icon="lucide:trash" width="24" height="24" />
            <span>{{ trashVisible ? 'Đóng' : 'Hiển thị' }} công việc spam</span>
          </div>
          <div class="menu-item" v-if="canHandleUser" @click="handleUserManagement">
            <Icon icon="lucide:users" width="24" height="24" />
            <span>Thêm người dùng</span>
          </div>
          <div class="menu-item" @click="handleChangePassword">
            <Icon icon="lucide:lock" width="24" height="24" />
            <span>Đổi mật khẩu</span>
          </div>
          <div class="menu-item logout" @click="logout">
            <Icon icon="lucide:log-out" width="24" height="24" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="nav-buttons">
      <button
        class="nav-button"
        :class="{ active: activeTab === 'todo' }"
        @click="setActiveTab('todo')"
      >
        Cần làm
      </button>
      <button
        class="nav-button"
        :class="{ active: activeTab === 'inProgress' }"
        @click="setActiveTab('inProgress')"
      >
        Đang làm
      </button>
      <button
        class="nav-button"
        :class="{ active: activeTab === 'done' }"
        @click="setActiveTab('done')"
      >
        Đã xong
      </button>
      <button
        v-if="showTrashButton"
        class="nav-button"
        :class="{ active: activeTab === 'trash' }"
        @click="setActiveTab('trash')"
      >
        Rác
      </button>
    </div>

    <!-- Content section -->
    <div class="mobile-content">
      <!-- Todo Tasks -->
      <div v-if="activeTab === 'todo'" class="task-list">
        <task-item-mobile
          v-for="item in list1"
          :key="item.taskId"
          :task="item"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask(item)"
          @edit-task="handleEditTask(item)"
        />
        <div v-if="list1.length === 0" class="empty-list">
          <p>Không có công việc nào trong danh sách</p>
        </div>
      </div>

      <!-- Notification content -->
      <div v-if="activeTab === 'notifications'" class="notification-list">
        <div v-if="notificationStore.loading" class="loading-notifications">
          <p>Đang tải thông báo...</p>
        </div>
        <div v-else-if="notificationStore.error" class="error-notifications">
          <p>{{ notificationStore.error }}</p>
          <button @click="loadNotifications" class="retry-btn">Thử lại</button>
        </div>
        <div v-else>
          <div
            v-for="notification in notificationStore.notifications"
            :key="notification.notificationId"
            class="notification-item"
            :class="{ 'unread': !notification.wasRead }"
            @click="markNotificationAsRead(notification.notificationId)"
          >
            <div class="notification-content">
              <p>{{ notification.message }}</p>
              <div class="notification-time">{{ formatNotificationTime(notification.createdAt) }}</div>
            </div>
            <div class="notification-status">
              <div v-if="!notification.wasRead" class="unread-dot"></div>
            </div>
          </div>
          <div v-if="notificationStore.notifications.length === 0" class="empty-notifications">
            <p>Không có thông báo nào</p>
          </div>
        </div>
      </div>

      <!-- In Progress Tasks -->
      <div v-if="activeTab === 'inProgress'" class="task-list">
        <task-item-mobile
          v-for="item in list2"
          :key="item.taskId"
          :task="item"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask(item)"
          @edit-task="handleEditTask(item)"
        />
        <div v-if="list2.length === 0" class="empty-list">
          <p>Không có công việc nào trong danh sách</p>
        </div>
      </div>

      <!-- Done Tasks -->
      <div v-if="activeTab === 'done'" class="task-list">
        <task-item-mobile
          v-for="item in list3"
          :key="item.taskId"
          :task="item"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask(item)"
          @edit-task="handleEditTask(item)"
        />
        <div v-if="list3.length === 0" class="empty-list">
          <p>Không có công việc nào trong danh sách</p>
        </div>
      </div>

      <!-- Trash Tasks -->
      <div v-if="activeTab === 'trash'" class="task-list">
        <task-item-mobile
          v-for="item in list4"
          :key="item.taskId"
          :task="item"
          @update-task="handleUpdateTask"
          @delete-task="handleDeleteTask(item)"
          @edit-task="handleEditTask(item)"
        />
        <div v-if="list4.length === 0" class="empty-list">
          <p>Không có công việc nào trong danh sách</p>
        </div>
      </div>
    </div>

    <!-- Use the updated FooterMobile component -->
    <FooterMobile
      @menu-click="handleMenuClick"
      @long-press="toggleTrashVisibility"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTaskManager } from '@/composables/uesTaskManager.js';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { useUserStore } from '@/stores/userStore.js';
import TaskItemMobile from '@/mobile/TaskItemMobile.vue';
import HeaderMobile from '@/mobile/components/HeaderMobile.vue';
import FooterMobile from '@/mobile/components/FooterMobile.vue';
import type { Task } from '@/types/task.js';

const route = useRoute();
const router = useRouter();
const activeTab = ref('todo');
const showTrashButton = ref(false);
const notificationStore = useNotificationStore();
const userStore = useUserStore();
const currentUserCode = ref('');
const userName = ref('');
const menuVisible = ref(false);
const trashVisible = ref(false);

// Computed properties for user permissions
const canHandleGroup = ref(false);
const canHandleUser = ref(false);
const canCreateTask = ref(false);

const handleMenuClick = () => {
  menuVisible.value = !menuVisible.value;
};

const closeMenu = () => {
  menuVisible.value = false;
};

// Menu action handlers
const goToGroupList = () => {
  router.push('/get-my-groups');
  closeMenu();
};

const handleMyInfo = () => {
  // Implement user info action
  console.log('My Info clicked');
  closeMenu();
};

const createGroup = () => {
  // Implement create group action
  console.log('Create Group clicked');
  closeMenu();
};

const openCreateTask = () => {
  // Implement create task action
  console.log('Create Task clicked');
  closeMenu();
};

const handleOpenTrash = () => {
  trashVisible.value = !trashVisible.value;
  showTrashButton.value = trashVisible.value;
  closeMenu();
};

const handleUserManagement = () => {
  // Implement user management action
  console.log('User Management clicked');
  closeMenu();
};

const handleChangePassword = () => {
  // Implement change password action
  console.log('Change Password clicked');
  closeMenu();
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUserCode');
  router.push('/login');
  closeMenu();
};

onMounted(async () => {
  const token = localStorage.getItem('token');
  const storedUserCode = localStorage.getItem('currentUserCode');

  if (token && storedUserCode) {
    currentUserCode.value = storedUserCode;

    // Set user code in store if not already set
    if (!userStore.getUserCode) {
      userStore.setUserInfo({ userCode: storedUserCode });
    }

    try {
      await loadNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }
});

const loadNotifications = async () => {
  if (currentUserCode.value) {
    await notificationStore.fetchNotifications(currentUserCode.value);
  }
};

const markNotificationAsRead = async (notificationId: number) => {
  await notificationStore.markAsRead(notificationId);
};

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};

const toggleTrashVisibility = () => {
  showTrashButton.value = !showTrashButton.value;
  trashVisible.value = showTrashButton.value;
};

const groupId = computed(() => {
  const id = Number(route.params.groupId);
  return isNaN(id) ? null : id;
});

const {
  list1,
  list2,
  list3,
  list4,
} = useTaskManager(groupId);

// Task handlers
const handleUpdateTask = (task: Task) => {
  // Implement update task action
  // console.log('Update task:', task);
};

const handleDeleteTask = (task: Task) => {
  // Implement delete task action
  // console.log('Delete task:', task);
};

const handleEditTask = (task: Task) => {
  // Implement edit task action
  // console.log('Edit task:', task);
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
.mobile-task-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Remove the header styles that were moved to HeaderMobile.vue */

/* mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 100;
}

.mobile-menu-panel {
  width: 100%;
  height: 80%;
  background-color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s forwards;
  border-radius: 15px 15px 0 0;
  position: relative;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.mobile-menu-header {
  height: auto;
  min-height: 140px;
  background-color: #4CAF50;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-greeting {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-greeting div {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.user-greeting div:first-child {
  font-size: 20px;
}

.mobile-menu-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item svg {
  margin-right: 15px;
  color: #555;
}

.menu-item span {
  font-size: 16px;
  color: #333;
}

.logout {
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.logout svg, .logout span {
  color: #e74c3c;
}

/* Navigation buttons */
.nav-buttons {
  display: flex;
  height: 7vh;
  min-height: 7vh;
  flex-shrink: 0;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.nav-button {
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-button.active {
  color: #17bf3b;
  border-bottom: 3px solid #bff0ca;
}

/* Content section */
.mobile-content {
  flex-grow: 1;
  background-color: #f9f9f9;
  overflow-y: auto;
  padding: 10px;
  padding-bottom: 7vh; /* Add padding to account for fixed footer */
  height: 79vh; /* The remaining height */
}

/* Task list styles */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-item h4 {
  margin: 0 0 3px 0;
  font-size: 16px;
}

/* Notification list styles */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item.unread {
  background-color: #f0f8ff;
}

.notification-content {
  flex: 1;
}

.notification-content p {
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

.empty-list, .empty-notifications, .loading-notifications, .error-notifications {
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
