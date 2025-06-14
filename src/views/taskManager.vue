<template>
  <HeaderOnly @toggle-trash="toggleTrashColumn" />
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

      <div class="col-3" id="spamColumn" v-if="isTrashVisible">
        <h3>Rác</h3>
        <Draggable
          class="list-group"
          :list="list4"
          group="tasks"
          @change="(event) => log(event, TaskState.SPAM)"
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

//trash
import { ref } from 'vue';
const isTrashVisible = ref(false);

const toggleTrashColumn = (visible: boolean) => {
  isTrashVisible.value = visible;
};

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
.row {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  gap: 40px;
}

.col-3 {
  width: 23%;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h3 {
  text-align: center;
  color: #333;
  margin-bottom: 15px;
}

.list-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-group-item {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.list-group-item h5 {
  margin: 0;
  font-size: 16px;
}

.list-group-item p {
  font-size: 14px;
  color: #555;
}

#todoColumn {
  background-color: #e8f5e9;
}

#inProgressColumn {
  background-color: #fff3e0;
}

#doneColumn {
  background-color: #c8e6c9;
}

#spamColumn {
  background-color: #ffcdd2;
}

</style>
