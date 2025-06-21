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
        <!-- Time Filter -->
        <div class="filter-group">
          <label><Icon icon="mdi:calendar-clock" /> Thời gian</label>
          <div class="options">
            <button
              v-for="timeFilter in timeFilters"
              :key="timeFilter.value"
              :class="{ active: selectedTimeFilter === timeFilter.value }"
              @click="selectTimeFilter(timeFilter.value)"
            >
              {{ timeFilter.label }}
            </button>
          </div>
        </div>

        <!-- Deadline Filter -->
        <div class="filter-group">
          <label><Icon icon="mdi:calendar" /> Ngày đến hạn</label>
          <div class="options">
            <button
              v-for="deadlineFilter in deadlineFilters"
              :key="deadlineFilter.value"
              :class="{ active: selectedDeadlineFilter === deadlineFilter.value }"
              @click="selectDeadlineFilter(deadlineFilter.value)"
            >
              {{ deadlineFilter.label }}
            </button>
          </div>
        </div>

        <!-- User Filter -->
        <div class="filter-group">
          <label><Icon icon="mdi:account" /> Người dùng</label>
          <div class="options">
            <button
              v-for="userFilter in userFilters"
              :key="userFilter.value"
              :class="{ active: selectedUserFilter === userFilter.value }"
              @click="selectUserFilter(userFilter.value)"
            >
              {{ userFilter.label }}
            </button>
            <input
              v-if="selectedUserFilter === 'specific'"
              v-model="specificUserId"
              type="text"
              placeholder="Nhập mã"
              class="user-input"
              @input="onUserInputChange"
            />
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
import { ref, reactive } from 'vue';
import { Icon } from '@iconify/vue';

// State
const isFilterVisible = ref(false);
const selectedTimeFilter = ref('all');
const selectedDeadlineFilter = ref('all');
const selectedUserFilter = ref('all');
const specificUserId = ref('');

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value;
};

// Filter options
const timeFilters = reactive([
  { label: 'Tất cả', value: 'all' },
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tháng này', value: 'this_month' },
  { label: 'Quá hạn', value: 'overdue' }
]);

const deadlineFilters = reactive([
  { label: 'Tất cả', value: 'all' },
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'this_week' },
  { label: 'Tháng này', value: 'this_month' },
  { label: 'Không có deadline', value: 'no_deadline' }
]);

const userFilters = reactive([
  { label: 'Tất cả', value: 'all' },
  { label: 'Của tôi', value: 'mine' },
  { label: 'Được giao', value: 'assigned_to_me' },
  { label: 'Cụ thể', value: 'specific' }
]);

// Methods
const selectTimeFilter = (value: string) => {
  selectedTimeFilter.value = value;
};

const selectDeadlineFilter = (value: string) => {
  selectedDeadlineFilter.value = value;
};

const selectUserFilter = (value: string) => {
  selectedUserFilter.value = value;
  if (value !== 'specific') {
    specificUserId.value = '';
  }
};

const onUserInputChange = () => {
  // Handled by v-model
};

const applyFilters = () => {
  const filterData = {
    timeFilter: selectedTimeFilter.value,
    deadlineFilter: selectedDeadlineFilter.value,
    userFilter: selectedUserFilter.value,
    specificUserId: specificUserId.value
  };
  console.log('Applying filters:', filterData);
  emit('apply-filters', filterData);
  isFilterVisible.value = false;
};

const clearFilters = () => {
  selectedTimeFilter.value = 'all';
  selectedDeadlineFilter.value = 'all';
  selectedUserFilter.value = 'all';
  specificUserId.value = '';
  console.log('Filters cleared');
  emit('clear-filters');
  isFilterVisible.value = false; // Hide after clearing
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

.options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.options button {
  padding: 4px 12px;
  border: 1px solid #ccc;
  border-radius: 16px;
  background-color: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.options button:hover {
  background-color: #e9ecef;
  border-color: #bbb;
}

.options button.active {
  background-color: #e0f3ff;
  color: #006ac7;
  border-color: #99cfff;
}

.user-input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100px;
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
</style>
