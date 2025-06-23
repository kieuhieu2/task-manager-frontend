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
              <div class="task-deadline" v-if="element.deadline">
                <p class="deadline-text">Đến hạn: {{ formatDeadline(element.deadline) }}</p>
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
              <div class="task-deadline" v-if="element.deadline">
                <p class="deadline-text">Hạn: {{ formatDeadline(element.deadline) }}</p>
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
              <div class="task-deadline" v-if="element.deadline">
                <p class="deadline-text">Đến hạn: {{ formatDeadline(element.deadline) }}</p>
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
              <div class="task-deadline" v-if="element.deadline">
                <p class="deadline-text">Đến hạn: {{ formatDeadline(element.deadline) }}</p>
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

  // Định dạng ngày deadline để hiển thị
  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      return date.toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error('Error formatting deadline:', error);
      return deadline;
    }
  };

  // Filter handling functions
  interface FilterData {
    hasDateRange: boolean;
    fromDate: string;
    toDate: string;
    hasDeadline: boolean;
    deadlineDate: string;
    currentGroupOnly: boolean;
  }

  const handleApplyFilters = (filterData: FilterData) => {
    console.log('TaskManager: Applying filters:', filterData);

    // Cập nhật tasksWasFiltered sau khi áp dụng các bộ lọc
    updateTaskListsFromStore();
  };

  const handleClearFilters = () => {
    console.log('TaskManager: Clearing all filters');

    // Xóa tất cả các bộ lọc trong store
    taskStore.clearAllFilters();

    // Cập nhật lại danh sách task hiển thị
    updateTaskListsFromStore();
  };

  // Cập nhật danh sách task từ store
  const updateTaskListsFromStore = () => {
    // Sử dụng mảng tasksWasFiltered từ store sau khi đã được lọc
    if (taskStore.tasksWasFiltered && taskStore.tasksWasFiltered.length > 0) {
      console.log('Updating task lists from tasksWasFiltered', taskStore.tasksWasFiltered.length);

      // Tạo danh sách theo trạng thái
      const todoTasks = taskStore.tasksWasFiltered.filter(task => task.state === TaskState.TODO);
      const inProgressTasks = taskStore.tasksWasFiltered.filter(task => task.state === TaskState.IN_PROGRESS);
      const doneTasks = taskStore.tasksWasFiltered.filter(task => task.state === TaskState.DONE);
      const spamTasks = taskStore.tasksWasFiltered.filter(task => task.state === TaskState.SPAM);

      // Cập nhật danh sách task hiển thị
      list1.value.splice(0, list1.value.length, ...todoTasks);
      list2.value.splice(0, list2.value.length, ...inProgressTasks);
      list3.value.splice(0, list3.value.length, ...doneTasks);
      list4.value.splice(0, list4.value.length, ...spamTasks);
    } else if (groupId.value !== null) {
      // Nếu không có task nào được lọc, hiển thị tất cả task của group hiện tại
      const allTasksInGroup = taskStore.getTasksForGroup(groupId.value);
      const todoTasks = allTasksInGroup.filter(task => task.state === TaskState.TODO);
      const inProgressTasks = allTasksInGroup.filter(task => task.state === TaskState.IN_PROGRESS);
      const doneTasks = allTasksInGroup.filter(task => task.state === TaskState.DONE);
      const spamTasks = allTasksInGroup.filter(task => task.state === TaskState.SPAM);

      list1.value.splice(0, list1.value.length, ...todoTasks);
      list2.value.splice(0, list2.value.length, ...inProgressTasks);
      list3.value.splice(0, list3.value.length, ...doneTasks);
      list4.value.splice(0, list4.value.length, ...spamTasks);
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

.deadline-text {
  font-size: 5px;
  color: #666;
  text-align: left;
  margin: 0;
  font-style: italic;
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
