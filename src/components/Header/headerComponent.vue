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
  <!--        <li @click="navigateToCreateUser">Thông tin cá nhân</li>-->
          <li @click="console.log('Thêm người dùng')">Thêm người dùng</li>
          <li @click="console.log('Đổi mật khẩu')">Đổi mật khẩu</li>
        </ul>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">

import { useHeaderComponent } from "@/components/Header/useHeaderComponent.ts";
const {
  dropdownOpen, groups, selectedGroup, toggleDropdown, selectGroup, menuOpen, toggleMenu
} = useHeaderComponent();

</script>

<style scoped lang="scss">
@use 'headerComponent.module.scss';
</style>

