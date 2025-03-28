<script setup lang="ts">
import HeaderOnly from '@/layouts/HeaderOnly/headerOnly.vue'
import { useGetMyGroups } from '@/composables/useGetMyGroups.js'
import { onMounted } from 'vue'

const { groups, fetchGroups } = useGetMyGroups();

// Gọi fetchGroups khi component được mount
onMounted(() => {
  fetchGroups();
});
</script>

<template>
  <HeaderOnly></HeaderOnly>
  <div class="group-container">
    <div
      v-for="group in groups"
      :key="group.groupId"
      class="group-item"
    >
      <button
        class="group-button">
        {{ group.nameOfGroup }}
      </button>
      <p class="group-description">{{ group.descriptionOfGroup }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './getMyGroup.module.scss';
</style>
