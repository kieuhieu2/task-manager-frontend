<template>
  <HeaderOnly />

  <div class="row">
    <div class="col-3" id="todoColumn">
      <h3>Cần Làm</h3>
      <Draggable
        class="list-group"
        :list="list1"
        group="tasks"
        @change="(event) => log(event, TaskState.TODO)"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item"
               @click="openTaskDetails(groupId, element.taskId)"
          >
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
        @change="(event) => log(event, TaskState.IN_PROGRESS)"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item"
               @click="openTaskDetails(groupId, element.taskId)"
          >
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
        @change="(event) => log(event, TaskState.DONE)"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item"
            @click="openTaskDetails(groupId, element.taskId)"
          >
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
        @change="(event) => log(event, TaskState.SPAM)"
        itemKey="taskId"
      >
        <template #item="{ element }">
          <div class="list-group-item"
               @click="openTaskDetails(groupId, element.taskId)"
          >
            <h5>{{ element.title }}</h5>
            <p>{{ element.description }}</p>
            <p>{{ element.percentDone }}%</p>
          </div>
        </template>
      </Draggable>
    </div>
  </div>

  <TaskDetails
    :task="selectedTask"
    :visible="isTaskDetailsVisible"
    @close="closeTaskDetails"
    @update-task="updateTask"
    @delete-task="deleteTask"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from "vue-router";
import HeaderOnly from "@/layouts/HeaderOnly/headerOnly.vue";
import { useTaskManager } from "@/composables/uesTaskManager.js";
import Draggable from "vuedraggable";
import { type Task, TaskState } from '@/types/task.js'
import { watch } from 'vue';
import { deleteTask, updateTask } from '@/api/task.js'
import TaskDetails from '@/components/TaskDetails/TaskDetails.vue'

const route = useRoute();

const groupId = computed(() => {
  const id = Number(route.params.groupId);
  return isNaN(id) ? null : id;
});

const {
  list1,
  list2,
  list3,
  list4,
  log,
  openTaskDetails,
  closeTaskDetails,
  isTaskDetailsVisible,
  selectedTask,
  loadTasks,
} = useTaskManager(groupId);

// Load tasks khi groupId thay đổi hoặc component mounted
onMounted(() => {
  if (groupId.value !== null) {
    loadTasks();
  } else {
    console.error("Group ID không hợp lệ");
  }
});

// Xử lý thay đổi groupId
watch(groupId, (newGroupId) => {
  if (newGroupId !== null) {
    loadTasks();
  } else {
    console.error("Group ID không hợp lệ");
  }
});

// Hàm xử lý update-task từ TaskDetails
const updateTaskHandler = async (updatedTask: Task) => {
  await updateTask(updatedTask);
};

// Hàm xử lý delete-task từ TaskDetails
const deleteTaskHandler = async () => {
  if (selectedTask.value) {
    await deleteTask(selectedTask.value.taskId);
  }
};
</script>

<style scoped lang="scss">
@use './taskManager.module.scss';
</style>
