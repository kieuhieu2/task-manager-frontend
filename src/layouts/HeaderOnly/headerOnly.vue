<template>
  <div class="header-only-layout">
    <Header />
    <main class="mt-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/layouts/components/Header/headerComponent.vue';
</script>
