<template>
  <div class="work-progress-overlay">
    <div class="work-progress-container">
      <button class="close-btn" @click="$emit('close')">[x]</button>
      <h3>Tiến độ các thành viên thực hiện công việc</h3>

      <div class="table-container">
        <table class="progress-table">
          <thead>
            <tr>
              <th>Mã người dùng</th>
              <th>Trạng thái</th>
              <th>Tiến độ</th>
              <th>Thời gian tạo công việc</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="progress in workProgressData" :key="progress.userCode">
              <td>{{ progress.userCode }}</td>
              <td>
                <span :class="getStateClass(progress.state)">
                  {{ translateState(progress.state) }}
                </span>
              </td>
              <td>{{ progress.percentDone }}%</td>
              <td>{{ formatDate(progress.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="isLoading" class="loading">
        Loading...
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchWorkProgress } from '@/api/task';
import type { WorkProgress } from '@/api/task';

defineEmits<{
  (e: 'close'): void;
}>();

// Get the taskId from localStorage to fetch work progress
const taskId = computed(() => {
  const storedTaskId = localStorage.getItem('taskId: ');
  return storedTaskId ? parseInt(storedTaskId, 10) : null;
});

const workProgressData = ref<WorkProgress[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const loadWorkProgress = async () => {
  if (!taskId.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const data = await fetchWorkProgress(taskId.value);
    workProgressData.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải tiến độ công việc';
    console.error('Error fetching work progress:', err);
  } finally {
    isLoading.value = false;
  }
};

const translateState = (state: string): string => {
  const stateMap: Record<string, string> = {
    'TODO': 'Cần làm',
    'IN_PROGRESS': 'Đang làm',
    'DONE': 'Đã xong',
    'SPAM': 'Rác'
  };

  return stateMap[state] || state;
};

const getStateClass = (state: string): string => {
  return `state-${state.toLowerCase().replace('_', '-')}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  if (taskId.value) {
    loadWorkProgress();
  }
});
</script>

<style scoped lang="scss">
.work-progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; // Higher than TaskDetails
}

.work-progress-container {
  position: relative;
  width: 60vw;
  height: 60vh;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;

  h3 {
    text-align: center;
    margin-bottom: 15px;
    color: #333;
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: red;
  }
}

.table-container {
  overflow-x: auto;
}

.progress-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-table th,
.progress-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.progress-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.progress-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.progress-table tr:hover {
  background-color: #f1f1f1;
}

.state-todo {
  background-color: #e8f5e9;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.state-in-progress {
  background-color: #fff3e0;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.state-done {
  background-color: #c8e6c9;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.state-spam {
  background-color: #ffcdd2;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.loading {
  text-align: center;
  margin-top: 15px;
  color: #666;
}

.error {
  color: #d32f2f;
  text-align: center;
  margin-top: 10px;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
