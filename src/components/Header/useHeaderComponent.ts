import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGetMyGroupsStore } from '@/stores/getMyGroups.js';
import type { Group } from '@/types/group.js';

export const useHeaderComponent = () => {
  const router = useRouter();
  const store = useGetMyGroupsStore();
  const showCreateGroup = ref(true);

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
    router.push(`/task-manager/${group.groupId}`);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    router.push(`/login`);
  };

  const createGroup = () => {
    showCreateGroup.value = true; // Mở layout GroupCreate
  };

  const closeCreateGroup = () => {
    showCreateGroup.value = false; // Đóng layout GroupCreate
  };

  fetchGroups();

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
  };
};
