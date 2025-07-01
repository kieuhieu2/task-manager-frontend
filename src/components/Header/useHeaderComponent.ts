import { ref, computed, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router';
import { useGetMyGroupsStore } from '@/stores/groupsStore.js';
import type { Group } from '@/types/group.js';
import { useNotificationStore } from '@/stores/notificationStore.js'
import { storeToRefs } from 'pinia'
import { getFullNameByUserCode, getMyAvatar } from '@/api/userApi.js'
import { useUserStore } from '@/stores/userStore.js'

export const useHeaderComponent = () => {
  const router = useRouter();
  const store = useGetMyGroupsStore();
  const userStore = useUserStore();
  const showCreateGroup = ref(false);

  // Begin notification
  const notificationStore = useNotificationStore()
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
  } = storeToRefs(notificationStore)

  // Tính số lượng thông báo chưa đọc
  const unreadNotificationsCount = computed(() => {
    return notifications.value.filter(notification => !notification.wasRead).length;
  });

  function getNotifications() {
    const userCode = localStorage.getItem('userCode') || ""
    notificationStore.fetchNotifications(userCode);
  }

  // Function to fetch user avatar
  async function fetchAvatar() {
    const userCode = localStorage.getItem('userCode');
    if (userCode) {
      try {
        const avatarUrl = await getMyAvatar(userCode);
        userStore.setAvatar(avatarUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    }
  }

  async function fetchFullName() {
    const userCode = localStorage.getItem('userCode');
    if (userCode) {
      try {
        const fullName = await getFullNameByUserCode(userCode);
        userStore.setFullName(fullName);
      } catch (error) {
        console.error('Error fetching fullname:', error);
      }
    }
  }

  onMounted(() => {
    getNotifications();
    fetchAvatar();
    fetchFullName();
  });

  const notificationDropdownOpen = ref(false);
  function toggleNotificationDropdown() {
    notificationDropdownOpen.value = !notificationDropdownOpen.value;
    // Đánh dấu tất cả thông báo chưa đọc thành đã đọc khi mở dropdown
    if (notificationDropdownOpen.value) {
      const unreadNotifications = notifications.value.filter(n => !n.wasRead);
      unreadNotifications.forEach(notification => {
        notificationStore.markAsRead(notification.notificationId);
      });
    }
  }

  function closeNotificationDropdown() {
    notificationDropdownOpen.value = false;
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

  const closeDropdown = () => {
    dropdownOpen.value = false;
  };

  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
  };

  const closeMenu = () => {
    menuOpen.value = false;
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
    closeDropdown,
    toggleMenu,
    closeMenu,
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
    closeNotificationDropdown,
    unreadNotificationsCount,

    //task
    openCreateTask,
    showCreateTask,
    closeCreateTask,

    //my info
    showMyInfo,
    handleMyInfo,
    closeMyInfo,

    // Avatar
    fetchAvatar,
    fetchFullName,
  };
};
