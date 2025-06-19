<template>
  <div class="header-wrapper">
    <header class="header">
      <h1 class="header__title">Quản lý công việc</h1>

      <div class="header__group-selector" @click="toggleDropdown">
        {{ selectedGroup }}
        <span class="arrow-down">▼</span>
        <ul v-if="dropdownOpen" class="dropdown-menu">
          <li v-for="group in groups" :key="group.groupId" @click="selectGroup(group)">
            {{ group.nameOfGroup }}
          </li>
        </ul>
      </div>

      <div class="notification-container">
        <button class="bell-icon" @click="toggleNotificationDropdown">
          <Icon icon="lucide:bell" />
        </button>
        <div v-if="notificationDropdownOpen" class="notification-dropdown">
          <div class="dropdown-header">
            Thông báo
          </div>
          <ul v-if="notifications.length">
            <li v-for="noti in notifications" :key="noti.notificationId">
              {{ noti.message }}
              <div class="noti-time">{{ formatTime(noti.createdAt)}}</div>
            </li>
          </ul>
          <div v-else class="empty">Không có thông báo nào</div>
          <div v-if="notificationsLoading" class="empty">Đang tải thông báo...</div>
          <div v-if="notificationsError" class="empty" style="color:red">{{ notificationsError }}</div>
        </div>
      </div>

      <div class="menu-container">
        <button class="menu-button" @click="toggleMenu">
          <img
            :src="userAvatar"
            alt="User Avatar"
            class="menu-avatar"
            @error="handleAvatarError"
          />
        </button>
        <ul v-if="menuOpen" class="menu-dropdown">
          <li @click="handleMyInfo">Thông tin cá nhân</li>
          <li v-if="canHandleGroup" @click="createGroup">Tạo nhóm công việc mới</li>
          <li v-if="canCreateTask" @click="openCreateTask">Thêm mới công việc của nhóm</li>
          <li @click="handleOpenTrash">
            {{ trashVisible ? 'Đóng' : 'Hiện thị' }} công việc spam
          </li>
          <li v-if="canHandleUser" @click="handleUserManagement">Thêm người dùng</li>
          <li @click="handleChangePassword">Đổi mật khẩu</li>
          <li @click="logout">Đăng xuất</li>
        </ul>
      </div>
    </header>
  </div>

  <Teleport to="body">
    <div v-if="showCreateGroup" class="modal-overlay">
      <div class="modal-content">
        <GroupCreate @close="closeCreateGroup" />
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="showCreateTask" class="modal-overlay">
      <div class="modal-content">
        <TaskCreateLayout @close="closeCreateTask" />
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="showMyInfo" class="modal-overlay">
      <div class="modal-content">
        <MyInfoLayout @close="closeMyInfo" />
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="userManagementVisible" class="modal-overlay">
      <div class="modal-content">
        <UserManagerLayout @close="closeUserManagement" />
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="changePasswordVisible" class="modal-overlay">
      <div class="modal-content">
        <ChangePasswordLayer @close="closeChangePassword" />
      </div>
    </div>
  </Teleport>

</template>

<script setup lang="ts">
import GroupCreate from '@/components/CreateGroupLayout.vue';
import { useHeaderComponent } from "@/components/Header/useHeaderComponent.ts";
import { formatTime } from '@/utils/formatTime.ts';
import TaskCreateLayout from '@/components/TaskCreateLayout.vue';
import MyInfoLayout from '@/components/user/MyInfoLayout.vue';
import UserManagerLayout from '@/components/user/UserManagerLayout.vue';
import ChangePasswordLayer from '@/components/user/ChangePasswordLayer.vue';
import { computed, ref } from 'vue';
import { defineEmits } from 'vue';
import { useUserStore } from "@/stores/userStore.ts";
import { Icon } from '@iconify/vue'

const userStore = useUserStore();
const userAvatar = computed(() => {
  // If there's no avatar in store, use a default one
  return userStore.getAvatar || 'avatar.jpeg';
});

const {
  dropdownOpen, groups, selectedGroup, toggleDropdown, selectGroup, menuOpen, toggleMenu,
  logout, createGroup, showCreateGroup, closeCreateGroup,

  // Notifications
  notifications, notificationsLoading, notificationsError, notificationDropdownOpen, toggleNotificationDropdown,

  // Task Creation
  showCreateTask, closeCreateTask, openCreateTask,

  // My Info
  showMyInfo, handleMyInfo, closeMyInfo,
} = useHeaderComponent();

const role = localStorage.getItem('role');

//handle trash
const emit = defineEmits<{
  (e: 'toggle-trash', value: boolean): void;
}>();

const trashVisible = ref(false);

const handleOpenTrash = () => {
  trashVisible.value = !trashVisible.value;
  emit('toggle-trash', trashVisible.value);
};

//menu logic
const canCreateTask = computed(() => {
  return role !== 'ROLE_COLLABORATOR' && role !== 'ROLE_STUDENT'
})

const canHandleUser = computed(() => {
  return role !== 'ROLE_COLLABORATOR' && role !== 'ROLE_STUDENT';
})

const canHandleGroup = computed(() => {
  return role !== 'ROLE_COLLABORATOR' && role !== 'ROLE_STUDENT';
})

// User manager
const userManagementVisible = ref(false);
const handleUserManagement = () => {
  userManagementVisible.value = true;
  menuOpen.value = false; // Close the menu
};
const closeUserManagement = () => {
  userManagementVisible.value = false;
};

// Change password
const changePasswordVisible = ref(false);
const handleChangePassword = () => {
  changePasswordVisible.value = true;
  menuOpen.value = false; // Close the menu
};
const closeChangePassword = () => {
  changePasswordVisible.value = false;
};

// Handle avatar error
const handleAvatarError = (e: Event) => {
  // Set a default avatar if the image fails to load
  const imgElement = e.target as HTMLImageElement;
  imgElement.src = '/avatar.jpeg';
};

</script>

<style scoped lang="scss">
@use 'headerComponent.module.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: auto;
  height: auto;
  overflow: hidden;
  position: relative;
}
</style>

