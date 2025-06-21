<template>
  <HeaderOnly @toggle-trash="toggleTrashColumn" />
  <LeftNavbar
    :is-visible="isNavbarVisible"
    @showCreateTask="handleShowCreateTask"
    @showCreateGroup="handleShowCreateGroup"
    @showSpam="handleShowSpam"
  />
  <button @click="toggleNavbar" class="navbar-toggle-button">
    {{ isNavbarVisible ? '<' : '>' }}
  </button>
  
  <div class="filter-container">
    <TaskFilter 
      @apply-filters="handleApplyFilters"
      @clear-filters="handleClearFilters"
    />
  </div>

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
            <div
              class="list-group-item"
              @click="groupId !== null && openTaskDetails(groupId, element.taskId)"
              :style="{ backgroundColor: getTaskBackgroundColor(element.deadline) }"
            >
              <h5>{{ element.title }}</h5>
              <p>{{ element.description }}</p>
              <div class="task-status-row">
                <p>{{ element.percentDone }}%</p>
                <p v-if="element.isCreator" style="color: red;">Bạn là người giao công việc này</p>
              </div>
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
            <div
              class="list-group-item"
              @click="groupId !== null && openTaskDetails(groupId, element.taskId)"
              :style="{ backgroundColor: getTaskBackgroundColor(element.deadline) }"
            >
              <h5>{{ element.title }}</h5>
              <p>{{ element.description }}</p>
              <div class="task-status-row">
                <p>{{ element.percentDone }}%</p>
                <p v-if="element.isCreator" style="color: red;">Bạn là người giao công việc này</p>
              </div>
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
            <div class="list-group-item" @click="groupId !== null && openTaskDetails(groupId, element.taskId)">
              <h5>{{ element.title }}</h5>
              <p>{{ element.description }}</p>
              <div class="task-status-row">
                <p>{{ element.percentDone }}%</p>
                <p v-if="element.isCreator" style="color: red;">Bạn là người giao công việc này</p>
              </div>
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
            <div
              class="list-group-item"
              @click="groupId !== null && openTaskDetails(groupId, element.taskId)"
              :style="{ backgroundColor: getTaskBackgroundColor(element.deadline) }"
            >
              <h5>{{ element.title }}</h5>
              <p>{{ element.description }}</p>
              <div class="task-status-row">
                <p>{{ element.percentDone }}%</p>
                <p v-if="element.isCreator" style="color: red;">Bạn là người giao công việc này</p>
              </div>
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

  <Teleport to="body">
    <div v-if="showCreateGroup" class="modal-overlay">
      <div class="modal-content">
        <CreateGroupLayout @close="showCreateGroup = false" />
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="showCreateTask" class="modal-overlay">
      <div class="modal-content">
        <TaskCreateLayout @close="showCreateTask = false" @submitted="handleTaskSubmitted" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import HeaderOnly from '@/layouts/HeaderOnly/headerOnly.vue';
import { useTaskManager } from '@/composables/uesTaskManager.js';
import Draggable from 'vuedraggable';
import TaskDetails from '@/components/TaskDetails/TaskDetails.vue';
import LeftNavbar from '@/components/LeftNavbar.vue';
import CreateGroupLayout from '@/components/CreateGroupLayout.vue';
import TaskCreateLayout from '@/components/TaskCreateLayout.vue';
import { TaskState } from '@/types/task';
import type { Task } from '@/types/task';
import { updateTask, deleteTask } from '@/api/task.js';
import { useTaskStore } from "@/stores/taskStore.ts";
import TaskFilter from '@/components/TaskFilter.vue';

const route = useRoute();
const taskStore = useTaskStore();

// Left Navbar state and methods
const isNavbarVisible = ref(false);
const showCreateTask = ref(false);
const showCreateGroup = ref(false);

const toggleNavbar = () => {
  isNavbarVisible.value = !isNavbarVisible.value;
};

const handleShowCreateTask = () => {
  showCreateTask.value = true;
  isNavbarVisible.value = false;
};

const handleShowCreateGroup = () => {
  showCreateGroup.value = true;
  isNavbarVisible.value = false;
};

const handleShowSpam = () => {
  isTrashVisible.value = !isTrashVisible.value;
  isNavbarVisible.value = false;
};

//trash
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
  refreshTasks,
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
    await updateTask(updatedTask);
    await refreshTasks();
  };

  const deleteTaskHandler = async () => {
    if (selectedTask.value && groupId.value !== null) {
      await deleteTask(selectedTask.value.taskId);
      await refreshTasks();
      closeTaskDetails();
    }
  };
  const handleTaskSubmitted = async () => {
    const currentGroupId = localStorage.getItem('groupId');
    if (currentGroupId) {
      await taskStore.refreshTasks(Number(currentGroupId));
    }
  };

  // Hàm để tính toán màu nền dựa trên deadline
  const getTaskBackgroundColor = (deadline?: string) => {
    if (!deadline) {
      return '#ffffff'; // Trắng nếu không có deadline
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);

    // Tính số ngày còn lại
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft <= 1) {
      return '#ffebee'; // Đỏ nhạt nếu deadline còn 3 ngày hoặc ít hơn
    } else if (daysLeft <= 3) {
      return '#fff3e0'; // Cam nhạt nếu deadline còn 7 ngày hoặc ít hơn
    } else if (daysLeft <= 7) {
      return '#ffffff'; // Vàng nhạt nếu deadline còn 14 ngày
    } else {
      return '#ffffff'; // Xanh lá nhạt cho các deadline xa hơn
    }
  };

  // Filter handling functions
  const handleApplyFilters = (filterData: any) => {
    console.log('TaskManager: Applying filters:', filterData);
    
    // TODO: Implement actual filtering logic here
    // For now, just log the filter data
    const { timeFilter, deadlineFilter, userFilter, specificUserId } = filterData;
    
    // Example of how you might implement filtering:
    // - timeFilter: 'today', 'this_week', 'this_month', 'overdue'
    // - deadlineFilter: 'today', 'this_week', 'this_month', 'no_deadline'
    // - userFilter: 'mine', 'assigned_to_me', 'specific'
    // - specificUserId: string when userFilter is 'specific'
    
    // You can filter the lists (list1, list2, list3, list4) based on these criteria
    // and update the displayed tasks accordingly
  };

  const handleClearFilters = () => {
    console.log('TaskManager: Clearing all filters');
    
    // TODO: Reset all lists to their original state
    // You might want to reload the original tasks here
    if (groupId.value !== null) {
      loadTasks();
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
  transition: transform 0.2s;
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

.task-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-toggle-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #82cf88;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: auto;
  height: auto;
  overflow: hidden;
  position: relative;
}

.task-manager-container {
  padding-top: 10px; /* Add some space from the filter bar */
}

.filter-container {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px;
}
</style>
