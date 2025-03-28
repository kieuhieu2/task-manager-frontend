<template>
  <HeaderOnly />

  <div class="row">
    <div class="col-3" id="todoColumn">
      <h3>Cần Làm</h3>
      <Draggable
        class="list-group"
        :list="list1"
        group="tasks"
        @change="log"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item">
            <h5>{{ element.title }}</h5>
            <p>{{ element.description }}</p>
            <p>{{ element.percentDone }}%</p>
          </div>
        </template>
      </Draggable>
    </div>

    <div class="col-3" id="inProgressColumn">
      <h3>Đang Làm</h3>
      <Draggable
        class="list-group"
        :list="list2"
        group="tasks"
        @change="log"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item">
            <h5>{{ element.title }}</h5>
            <p>{{ element.description }}</p>
            <p>{{ element.percentDone }}%</p>
          </div>
        </template>
      </Draggable>
    </div>

    <div class="col-3" id="doneColumn">
      <h3>Đã Xong</h3>
      <Draggable
        class="list-group"
        :list="list3"
        group="tasks"
        @change="log"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item">
            <h5>{{ element.title }}</h5>
            <p>{{ element.description }}</p>
            <p>{{ element.percentDone }}%</p>
          </div>
        </template>
      </Draggable>
    </div>

    <div class="col-3" id="spamColumn">
      <h3>Rác</h3>
      <Draggable
        class="list-group"
        :list="list4"
        group="tasks"
        @change="log"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item">
            <h5>{{ element.title }}</h5>
            <p>{{ element.description }}</p>
            <p>{{ element.percentDone }}%</p>
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from "vue-router";
import HeaderOnly from "@/layouts/HeaderOnly/headerOnly.vue";
import { useTaskManager } from "@/composables/uesTaskManager.js";
import Draggable from "vuedraggable";
import { useTaskStore } from '@/store/taskManager.js'

const route = useRoute();

const groupId = computed(() => {
  const id = Number(route.params.groupId);
  return isNaN(id) ? null : id;
});

const taskStore = useTaskStore();

onMounted(() => {
  if (groupId.value) {
    taskStore.loadTasks(groupId.value);
  } else {
    console.error("Group ID không hợp lệ");
  }
});

const { list1, list2, list3, list4, log } = useTaskManager();
</script>

<style scoped lang="scss">
@use './taskManager.module.scss';
</style>
