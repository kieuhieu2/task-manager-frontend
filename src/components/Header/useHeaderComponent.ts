import { ref, computed, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router';
import { useGetMyGroupsStore } from '@/stores/getMyGroups.js';
import type { Group } from '@/types/group.js';
import { useNotificationStore } from '@/stores/notificationStore.js'
import { storeToRefs } from 'pinia'

export const useHeaderComponent = () => {
  const router = useRouter();
  const store = useGetMyGroupsStore();
  const showCreateGroup = ref(false);

  // Begin notification
  const notificationStore = useNotificationStore()
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
  } = storeToRefs(notificationStore)

  function getNotifications() {
    const userCode = localStorage.getItem('userCode') || ""
    notificationStore.fetchNotifications(userCode);
  }

  onMounted(() => {
    getNotifications()
  });

  const notificationDropdownOpen = ref(false);
  function toggleNotificationDropdown() {
    notificationDropdownOpen.value = !notificationDropdownOpen.value;
    //  call api to set notification as read
  }

  // end notifications

  // State cho dropdown và menu
  const dropdownOpen = ref(false);
  const menuOpen = ref(false);
  const selectedGroupId = ref<number | null>(null); // Lưu groupId của nhóm được chọn

  // Lấy danh sách nhóm từ stores
  const groups = computed(() => store.groups);

  // Tính toán tên nhóm được chọn để hiển thị trong header
  const selectedGroup = computed(() => {
    const group = store.groups.find(g => g.groupId === selectedGroupId.value);
    return group ? group.nameOfGroup : 'Chọn nhóm';
  });

  // Gọi API để lấy danh sách nhóm nếu chưa có
  const fetchGroups = async () => {
    if (store.groups.length === 0) { // Chỉ gọi API nếu chưa có dữ liệu
      try {
        await store.fetchGroups();
        // Mặc định chọn nhóm đầu tiên nếu chưa có nhóm được chọn
        if (store.groups.length > 0 && selectedGroupId.value === null) {
          selectedGroupId.value = store.groups[0].groupId;
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhóm:', error);
      }
    }
  };

  // Toggle dropdown và menu
  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };

  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
  };

  const selectGroup = (group: Group) => {
    selectedGroupId.value = group.groupId;
    dropdownOpen.value = false;
    localStorage.setItem('groupId', String(group.groupId));
    router.push(`/task-manager/${group.groupId}`);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    router.push(`/login`);
  };

  const createGroup = () => {
    showCreateGroup.value = true;
  };

  const closeCreateGroup = () => {
    showCreateGroup.value = false;
  };

  fetchGroups();

  const showCreateTask = ref(false);
  const openCreateTask = () => {
    showCreateTask.value = true;
  };
  const closeCreateTask = () => {
    showCreateTask.value = false;
  };

  // handle my info
  const showMyInfo = ref(false)

  const handleMyInfo = () => {
    showMyInfo.value = true
    console.log('Đã mở modal')

  }

  const closeMyInfo = () => {
    showMyInfo.value = false
  }

  return {
    dropdownOpen,
    menuOpen,
    groups,
    selectedGroup,
    toggleDropdown,
    toggleMenu,
    selectGroup,
    logout,
    createGroup,
    showCreateGroup,
    closeCreateGroup,

    // Notifications
    notifications,
    notificationsLoading,
    notificationsError,
    notificationDropdownOpen,
    toggleNotificationDropdown,

    //task
    openCreateTask,
    showCreateTask,
    closeCreateTask,

    //my info
    showMyInfo,
    handleMyInfo,
    closeMyInfo,
  };
};
