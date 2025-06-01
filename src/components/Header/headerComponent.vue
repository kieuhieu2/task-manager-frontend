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
          <span>🔔</span>
          <!-- No badge needed, since all are read -->
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
        <button class="menu-button" @click="toggleMenu">☰</button>
        <ul v-if="menuOpen" class="menu-dropdown">
          <li>Thông tin cá nhân</li>
          <li @click="createGroup">Tạo nhóm công việc mới</li>
          <li @click="openCreateTask">Thêm mới công việc của nhóm</li>
          <li @click="console.log('Thêm người dùng')">Thêm người dùng</li>
          <li @click="console.log('Đổi mật khẩu')">Đổi mật khẩu</li>
          <li @click="logout">Đăng xuất</li>
        </ul>
      </div>
    </header>
  </div>
  <!-- Hiển thị GroupCreate như modal khi showCreateGroup là true -->
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

</template>

<script setup lang="ts">
import GroupCreate from '@/components/CreateGroupLayout.vue';
import { useHeaderComponent } from "@/components/Header/useHeaderComponent.ts";
import { formatTime } from '@/utils/formatTime.ts';
import TaskCreateLayout from '@/components/TaskCreateLayout.vue'

const {
  dropdownOpen, groups, selectedGroup, toggleDropdown, selectGroup, menuOpen, toggleMenu,
  logout, createGroup, showCreateGroup, closeCreateGroup,

  // Notifications
  notifications, notificationsLoading, notificationsError, notificationDropdownOpen, toggleNotificationDropdown,

  // Task Creation
  showCreateTask, closeCreateTask, openCreateTask
} = useHeaderComponent();

</script>

<style scoped lang="scss">
@use 'headerComponent.module.scss';
</style>

