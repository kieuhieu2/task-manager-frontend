<template>
  <div class="filter-wrapper">
    <div class="toggle-container">
      <button @click="toggleFilter" class="filter-toggle-btn">
        <Icon icon="mdi:filter-variant" />
        <span>Lọc</span>
      </button>
    </div>

    <div v-if="isFilterVisible" class="filter-popover">
      <div class="filter-content">
        <!-- Date Range Filter -->
        <div class="filter-group">
          <label><Icon icon="mdi:calendar-clock" />Khoảng thời gian</label>
          <div class="date-range-inputs">
            <div class="date-input-container">
              <label for="fromDate">Từ:</label>
              <input
                type="date"
                id="fromDate"
                v-model="fromDate"
                class="date-input"
              />
            </div>
            <div class="date-input-container">
              <label for="toDate">Đến:</label>
              <input
                type="date"
                id="toDate"
                v-model="toDate"
                class="date-input"
              />
            </div>
          </div>
        </div>

        <!-- Deadline Filter -->
        <div class="filter-group">
          <label class="deadline-label"><Icon icon="mdi:calendar" /> Ngày đến hạn</label>
          <div class="date-input-wrapper">
            <input
              type="date"
              id="deadlineDate"
              v-model="deadlineDate"
              class="date-input"
            />
          </div>
        </div>

        <!-- Current Group Only Filter -->
        <div class="filter-group">
          <div class="checkbox-option">
            <input
              type="checkbox"
              id="currentGroupOnly"
              v-model="currentGroupOnly"
              class="filter-checkbox"
            />
            <label for="currentGroupOnly"><Icon icon="mdi:account-group" /> Chỉ trong nhóm hiện tại</label>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <button @click="applyFilters" class="apply-btn">
          <Icon icon="mdi:check" /> Áp dụng
        </button>
        <button @click="clearFilters" class="clear-btn">
          <Icon icon="mdi:close" /> Xóa
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { fetchTasksByDateRange } from '@/api/task';
import { useTaskStore } from '../stores/taskStore';

// State
const isFilterVisible = ref(false);
const fromDate = ref('');
const toDate = ref('');
const deadlineDate = ref('');
const currentGroupOnly = ref(true);
const taskStore = useTaskStore();
const isLoading = ref(false);

// Đồng bộ các giá trị từ store khi component được tạo
onMounted(() => {
  // Đồng bộ các giá trị từ currentFilters của store
  if (taskStore.currentFilters) {
    // Date range
    fromDate.value = taskStore.currentFilters.dateRange.fromDate;
    toDate.value = taskStore.currentFilters.dateRange.toDate;

    // Deadline
    deadlineDate.value = taskStore.currentFilters.deadline.date;

    // Current group only
    currentGroupOnly.value = taskStore.currentFilters.currentGroupOnly;
  }
});

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value;
};

// Watch for changes in date range and automatically fetch tasks
watch([fromDate, toDate], async ([newFromDate, newToDate]) => {
  if (newFromDate && newToDate) {
    taskStore.currentFilters.dateRange.fromDate = newFromDate;
    taskStore.currentFilters.dateRange.toDate = newToDate;
    await fetchTasksByDateRangeHandler(newFromDate, newToDate);
  }
});

// Fetch tasks by date range
const fetchTasksByDateRangeHandler = async (from: string, to: string) => {
  try {
    isLoading.value = true;
    const userCode = localStorage.getItem('userCode') || '';

    if (!userCode) {
      console.error('User code not found in localStorage');
      return;
    }

    const tasks = await fetchTasksByDateRange(userCode, from, to);

    if (tasks) {
      // Add the tasks to the store with a flag to mark them as date range filtered
      taskStore.addDateRangeFilteredTasks(tasks);
      console.log('Tasks fetched by date range:', tasks.length);
    }
  } catch (error) {
    console.error('Error fetching tasks by date range:', error);
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
  // Cập nhật giá trị vào đối tượng lọc trong store
  taskStore.currentFilters.dateRange.active = !!(fromDate.value && toDate.value);
  taskStore.currentFilters.dateRange.fromDate = fromDate.value;
  taskStore.currentFilters.dateRange.toDate = toDate.value;

  taskStore.currentFilters.deadline.active = !!deadlineDate.value;
  taskStore.currentFilters.deadline.date = deadlineDate.value;

  taskStore.currentFilters.currentGroupOnly = currentGroupOnly.value;

  // Áp dụng tất cả các bộ lọc
  taskStore.applyAllFilters();

  // Tạo đối tượng filter data để emit
  const filterData = {
    // Thông tin lọc khoảng thời gian
    hasDateRange: taskStore.currentFilters.dateRange.active,
    fromDate: fromDate.value,
    toDate: toDate.value,

    // Thông tin lọc ngày đến hạn
    hasDeadline: taskStore.currentFilters.deadline.active,
    deadlineDate: deadlineDate.value,

    // Thông tin lọc nhóm hiện tại
    currentGroupOnly: currentGroupOnly.value
  };

  // Ghi log
  console.log('Applying filters:', filterData);

  // Emit event để component cha biết về thay đổi filter
  emit('apply-filters', filterData);

  // Không đóng popover sau khi áp dụng lọc
  // isFilterVisible.value = false;
};

const clearFilters = () => {
  // Xóa các giá trị filter
  fromDate.value = '';
  toDate.value = '';
  deadlineDate.value = '';
  currentGroupOnly.value = true;

  // Xóa tất cả các bộ lọc từ store
  taskStore.clearAllFilters();

  // Ghi log
  console.log('Filters cleared');

  // Emit event để component cha biết
  emit('clear-filters');

  // Đóng popover
  isFilterVisible.value = false;
};

const emit = defineEmits(['apply-filters', 'clear-filters']);
</script>

<style scoped>
.filter-wrapper {
  width: auto;
}

.toggle-container {
  display: flex;
  justify-content: flex-end;
  margin: 10px 0;
}

.filter-toggle-btn {
  padding: 8px 16px;
  background-color: #82cf88;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}
.filter-toggle-btn:hover {
  background-color: #0056b3;
}

.filter-popover {
  margin-top: 8px;
  background-color: #ffffff;
  border-radius: 30px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.filter-content {
  display: flex;
  gap: 24px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-range-inputs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.date-input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-input-container label {
  font-size: 12px;
  font-weight: normal;
}

.date-input-wrapper {
  display: flex;
  align-items: center;
}

.date-input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 13px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.filter-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-option label {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.filter-actions {
  display: flex;
  gap:5px;
  align-self: flex-end;
  height: 25px;
  margin-top: 5px;
  border-radius: 30px;
}

.apply-btn,
.clear-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.apply-btn {
  background-color: #28a745;
}
.apply-btn:hover {
  background-color: #218838;
}

.clear-btn {
  background-color: #dc3545;
}
.clear-btn:hover {
  background-color: #c82333;
}

.deadline-label {
  padding-bottom: 20px;
  padding-top: 2px;
}
</style>
