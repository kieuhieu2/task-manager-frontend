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
      <div class="menu-container">
        <button class="menu-button" @click="toggleMenu">☰</button>
        <ul v-if="menuOpen" class="menu-dropdown">
          <li>Thông tin cá nhân</li>
          <li @click="createGroup">Tạo nhóm công việc mới</li>
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
</template>

<script setup lang="ts">
import GroupCreate from '@/components/CreateGroupLayout.vue';

import { useHeaderComponent } from "@/components/Header/useHeaderComponent.ts";
const {
  dropdownOpen, groups, selectedGroup, toggleDropdown, selectGroup, menuOpen, toggleMenu,
  logout, createGroup, showCreateGroup, closeCreateGroup
} = useHeaderComponent();

</script>

<style scoped lang="scss">
@use 'headerComponent.module.scss';
</style>

