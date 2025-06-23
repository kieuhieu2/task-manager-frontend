import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { fetchTasks, updateTaskState, updateTask as updateTaskApi, deleteTask as deleteTaskApi, getFileOfTask } from '@/api/task.js'
import { type Task, TaskState } from '@/types/task.js'

export const useTaskStore = defineStore('taskStore', () => {
  const tasksByGroup = ref<{ [groupId: number]: Task[] }>({});
  const selectedTaskFile: Ref<{ fileUrl: string; fileType: string; fileName?: string } | null> = ref(null);

  // Mảng chứa các task từ API khi lọc theo khoảng thời gian
  const tasksInGroupFromFilterApi = ref<Task[]>([]);

  // Mảng chứa kết quả cuối cùng sau khi áp dụng tất cả điều kiện lọc
  const tasksWasFiltered = ref<Task[]>([]);

  // Đối tượng chứa các điều kiện lọc hiện tại
  const currentFilters = ref({
    dateRange: {
      active: false,
      fromDate: '',
      toDate: ''
    },
    deadline: {
      active: false,
      date: ''
    },
    currentGroupOnly: true
  });

  // Lưu trữ ID nhóm hiện tại
  const currentGroupId = ref<number | null>(localStorage.getItem('groupId') ? Number(localStorage.getItem('groupId')) : null);

  const loadTasks = async (groupId: number) => {
    try {
      const tasks = (await fetchTasks(groupId)) ?? [];
      tasksByGroup.value[groupId] = tasks.map(task => ({
        ...task,
        fileUrl: task.fileUrl || undefined,
        fileType: task.fileType ?? null,
      })) as Task[];

      // Cập nhật currentGroupId khi load tasks
      currentGroupId.value = groupId;

      // Reset filtered tasks when loading new tasks
      resetFilters();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Method để refresh tasks sau khi tạo mới
  const refreshTasks = async (groupId: number) => {
    try {
      const tasks = (await fetchTasks(groupId)) ?? [];
      tasksByGroup.value[groupId] = tasks.map(task => ({
        ...task,
        fileUrl: task.fileUrl || undefined,
        fileType: task.fileType ?? null,
      })) as Task[];

      // Cập nhật currentGroupId khi refresh tasks
      currentGroupId.value = groupId;
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const getTasksForGroup = (groupId: number) => {
    return tasksByGroup.value[groupId] || [];
  };

  const updateStateOfTask = async (groupId: number, updatedTask: Task) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === updatedTask.taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...updatedTask };
        tasksByGroup.value[groupId] = [...tasks]
        try {
          await updateTaskState(updatedTask.taskId, updatedTask.state);
        } catch (error) {
          console.error('Error updating task state:', error);
        }
      } else {
        console.error('Task not found:', updatedTask.taskId, 'in group:', groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  const updateTask = async (groupId: number, updatedTask: Task) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === updatedTask.taskId);
      if (taskIndex !== -1) {
        try {
          const returnedTask = await updateTaskApi(updatedTask);
          // Ensure returnedTask is a valid object and matches the Task type
          if (returnedTask !== undefined && returnedTask !== null && typeof returnedTask === 'object' && !Array.isArray(returnedTask)) {
            const validatedTask = returnedTask as Partial<Task>;
            tasks[taskIndex] = {
              ...tasks[taskIndex], // Preserve existing task properties
              ...validatedTask,   // Merge with returnedTask properties
            } as Task;
          } else {
            console.error('Invalid returnedTask:', returnedTask);
          }
        } catch (error) {
          console.error('Error updating task:', error);
        }
      } else {
        console.error('Task not found:', updatedTask.taskId, 'in group:', groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  const deleteTask = async (groupId: number, taskId: number) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const taskIndex = tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex !== -1) {
        try {
          await deleteTaskApi(taskId);
          tasks.splice(taskIndex, 1);
          tasksByGroup.value[groupId] = [...tasks];
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      }
    }
  };

  const fetchFileForTask = async (taskId: number) => {
    try {
      const fileData = await getFileOfTask(taskId) as { fileUrl: string; fileType?: string; fileName?: string } | void;
      if (!fileData) {
        console.log('No file data received');
        selectedTaskFile.value = null;
        return;
      }

      selectedTaskFile.value = {
        fileUrl: fileData.fileUrl,
        fileType: fileData.fileType || 'unknown',
        fileName: fileData.fileName
      };
      console.log('File fetched successfully:', selectedTaskFile.value);
    } catch (error) {
      console.error('Error fetching file for task:', error);
      selectedTaskFile.value = null;
    }
  };

  const openTask = async (groupId: number, taskId: number) => {
    const tasks = tasksByGroup.value[groupId];
    if (tasks) {
      const task = tasks.find(t => t.taskId === taskId);
      if (task) {
        try {
          await fetchFileForTask(taskId); // Fetch the file for the task when it is opened
        } catch (error) {
          console.error('Error opening task:', error);
        }
      } else {
        console.error('Task not found:', taskId, 'in group:', groupId);
      }
    } else {
      console.error('Group not found:', groupId);
    }
  };

  // Thêm tasks từ date range filter vào store với flag đánh dấu
  const addDateRangeFilteredTasks = (tasks: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) {
      console.error('Invalid tasks data:', tasks);
      return;
    }

    // Lưu trữ tasks từ API riêng
    tasksInGroupFromFilterApi.value = tasks.map(task => ({
      ...task,
      isFromDateRangeFilter: true,
      fileUrl: task.fileUrl || undefined,
      fileType: task.fileType ?? null,
    }));

    // Cập nhật điều kiện lọc
    currentFilters.value.dateRange.active = true;

    // Áp dụng filter
    applyAllFilters();
  };

  // Áp dụng tất cả các điều kiện lọc để tạo tasksWasFiltered
  const applyAllFilters = () => {
    console.log('Applying all filters with current settings:', currentFilters.value);

    // Bắt đầu với tất cả các task của nhóm hiện tại
    let allTasks: Task[] = [];

    // Nếu có nhóm hiện tại, lấy tasks của nhóm đó
    if (currentGroupId.value !== null) {
      allTasks = [...(tasksByGroup.value[currentGroupId.value] || [])];
    } else {
      // Nếu không có nhóm hiện tại, kết hợp tất cả các task từ tất cả các nhóm
      Object.values(tasksByGroup.value).forEach(groupTasks => {
        allTasks = [...allTasks, ...groupTasks];
      });
    }

    // Thêm tasks từ API (nếu có)
    if (tasksInGroupFromFilterApi.value.length > 0) {
      // Xóa tasks trùng lặp (có cùng taskId)
      const existingTaskIds = new Set(allTasks.map(task => task.taskId));
      const uniqueApiTasks = tasksInGroupFromFilterApi.value.filter(
        task => !existingTaskIds.has(task.taskId)
      );

      allTasks = [...allTasks, ...uniqueApiTasks];
    }

    // Áp dụng điều kiện lọc
    let filteredTasks = [...allTasks];

    // Lọc theo deadline nếu active
    if (currentFilters.value.deadline.active && currentFilters.value.deadline.date) {
      const targetDate = new Date(currentFilters.value.deadline.date);
      filteredTasks = filteredTasks.filter(task => {
        if (!task.deadline) return false;
        const taskDeadline = new Date(task.deadline);
        return taskDeadline <= targetDate;
      });
    }

    // Lọc theo nhóm hiện tại nếu yêu cầu
    if (currentFilters.value.currentGroupOnly && currentGroupId.value !== null) {
      filteredTasks = filteredTasks.filter(task => task.groupId === currentGroupId.value);
    }

    // Cập nhật tasksWasFiltered
    tasksWasFiltered.value = filteredTasks;
    console.log(`Filter applied: ${filteredTasks.length} tasks remaining`);
  };

  // Lọc tasks theo deadline
  const filterTasksByDeadline = (deadlineDate: string) => {
    if (!deadlineDate) return;

    // Cập nhật điều kiện lọc
    currentFilters.value.deadline.active = true;
    currentFilters.value.deadline.date = deadlineDate;

    // Áp dụng tất cả các điều kiện lọc
    applyAllFilters();
  };

  // Xóa các task đã lọc theo deadline
  const clearDeadlineFilteredTasks = () => {
    // Cập nhật điều kiện lọc
    currentFilters.value.deadline.active = false;
    currentFilters.value.deadline.date = '';

    // Áp dụng lại các điều kiện còn lại
    applyAllFilters();
  };

  // Lọc task chỉ hiển thị trong nhóm hiện tại
  const filterTasksByCurrentGroup = () => {
    if (currentGroupId.value === null) {
      console.error('No current group set');
      return;
    }

    // Cập nhật điều kiện lọc
    currentFilters.value.currentGroupOnly = true;

    // Áp dụng tất cả các điều kiện lọc
    applyAllFilters();

    console.log(`Found ${tasksWasFiltered.value.length} tasks in current group ${currentGroupId.value}`);
  };

  // Xóa lọc nhóm hiện tại
  const clearCurrentGroupFilter = () => {
    // Cập nhật điều kiện lọc
    currentFilters.value.currentGroupOnly = false;

    // Áp dụng lại các điều kiện còn lại
    applyAllFilters();
  };

  // Xóa các task được đánh dấu từ date range filter
  const clearDateRangeFilteredTasks = () => {
    // Xóa các task từ API
    tasksInGroupFromFilterApi.value = [];

    // Cập nhật điều kiện lọc
    currentFilters.value.dateRange.active = false;
    currentFilters.value.dateRange.fromDate = '';
    currentFilters.value.dateRange.toDate = '';

    // Áp dụng lại các điều kiện còn lại
    applyAllFilters();
  };

  // Reset tất cả các bộ lọc về trạng thái ban đầu
  const resetFilters = () => {
    currentFilters.value = {
      dateRange: {
        active: false,
        fromDate: '',
        toDate: ''
      },
      deadline: {
        active: false,
        date: ''
      },
      currentGroupOnly: false
    };

    tasksInGroupFromFilterApi.value = [];
    tasksWasFiltered.value = [];
  };

  // Xóa tất cả các bộ lọc
  const clearAllFilters = () => {
    resetFilters();
    applyAllFilters();
  };

  return {
    tasksByGroup,
    tasksInGroupFromFilterApi,
    tasksWasFiltered,
    currentFilters,
    selectedTaskFile,
    currentGroupId,
    loadTasks,
    refreshTasks,
    getTasksForGroup,
    updateStateOfTask,
    updateTask,
    deleteTask,
    fetchFileForTask,
    openTask,
    addDateRangeFilteredTasks,
    clearDateRangeFilteredTasks,
    filterTasksByDeadline,
    clearDeadlineFilteredTasks,
    filterTasksByCurrentGroup,
    clearCurrentGroupFilter,
    clearAllFilters,
    applyAllFilters,
    resetFilters
  };
});
