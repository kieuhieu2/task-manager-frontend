<template>
  <div class="header-only-layout">
    <Header @toggle-trash="$emit('toggle-trash', $event)" />
    <main class="mt-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header/headerComponent.vue';
</script>
