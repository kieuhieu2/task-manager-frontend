<template>
  <HeaderOnly />
  <div class="task-manager-container">
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
            <div class="list-group-item" @click="openTaskDetails(groupId, element.taskId)">
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
            <div class="list-group-item" @click="openTaskDetails(groupId, element.taskId)">
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
            <div class="list-group-item" @click="openTaskDetails(groupId, element.taskId)">
              <h5>{{ element.title }}</h5>
              <p>{{ element.description }}</p>
              <p>{{ element.percentDone }}%</p>
            </div>
          </template>
        </Draggable>
      </div>

<!--      <div class="col-3" id="spamColumn">-->
<!--        <h3>Rác</h3>-->
<!--        <Draggable-->
<!--          class="list-group"-->
<!--          :list="list4"-->
<!--          group="tasks"-->
<!--          @change="(event) => log(event, TaskState.SPAM)"-->
<!--          itemKey="taskId"-->
<!--        >-->
<!--          <template #item="{ element }">-->
<!--            <div class="list-group-item" @click="openTaskDetails(groupId, element.taskId)">-->
<!--              <h5>{{ element.title }}</h5>-->
<!--              <p>{{ element.description }}</p>-->
<!--              <p>{{ element.percentDone }}%</p>-->
<!--            </div>-->
<!--          </template>-->
<!--        </Draggable>-->
<!--      </div>-->
    </div>
  </div>


  <TaskDetails
    :task="selectedTask"
    :visible="isTaskDetailsVisible"
    @close="closeTaskDetails"
    @update-task="updateTaskHandler"
    @delete-task="deleteTaskHandler"
  />

</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import HeaderOnly from '@/layouts/HeaderOnly/headerOnly.vue';
import { useTaskManager } from '@/composables/uesTaskManager.js';
import Draggable from 'vuedraggable';
import TaskDetails from '@/components/TaskDetails/TaskDetails.vue';
import { TaskState } from '@/types/task';
import type { Task } from '@/types/task';
import { updateTask, deleteTask } from '@/api/task.js';

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

  onMounted(() => {
    if (groupId.value !== null) {
      loadTasks();
    } else {
      console.error("Group ID không hợp lệ");
    }
  });

  watch(groupId, (newGroupId) => {
    if (newGroupId !== null) {
      loadTasks();
    } else {
      console.error("Group ID không hợp lệ");
    }
  });

  const updateTaskHandler = async (updatedTask: Task) => {
    if (groupId.value === null) {
      console.error('Group ID is null');
      return;
    }
    await updateTask(updatedTask.taskId, updatedTask);
    await loadTasks();
  };

  const deleteTaskHandler = async () => {
    if (selectedTask.value && groupId.value !== null) {
      await deleteTask(selectedTask.value.taskId);
      await loadTasks();
      closeTaskDetails();
    }
  };
</script>

<style scoped lang="scss">
@use './taskManager.module.scss';
</style>
