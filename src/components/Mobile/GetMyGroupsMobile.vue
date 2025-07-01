<template>
  <div class="mobile-groups-container">
    <!-- Header -->
    <HeaderMobile />

    <!-- Group list -->
    <div class="groups-list">
      <div v-if="loading" class="loading-container">
        <p>Đang tải danh sách nhóm...</p>
      </div>
      <div v-else-if="groups.length === 0" class="empty-list">
        <p>Bạn chưa có nhóm nào</p>
      </div>
      <GroupItem
        v-else
        v-for="group in groups"
        :key="group.groupId"
        :group="group"
        @group-click="handleGroupClick(group)"
        @update="updateGroupHandler"
        @delete-group="deleteGroupHandler(group.groupId)"
        @show-members="showGroupMembers(group)"
      />
    </div>

    <!-- Group members modal -->
    <GroupMembersLayout
      v-if="showMembersModal"
      :groupId="selectedGroupId"
      :isLeader="selectedGroupIsLeader"
      @close="closeMembersModal"
    />

    <!-- Footer (updated) -->
    <FooterMobile
      @menu-click="handleMenuClick"
      @long-press="toggleTrashVisibility"
    />

    <!-- Create group modal component would go here -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeaderMobile from '@/components/Mobile/components/HeaderMobile.vue';
import FooterMobile from '@/components/Mobile/components/FooterMobile.vue';
import GroupItem from '@/components/Mobile/components/GroupItem.vue';
import GroupMembersLayout from '@/components/GroupMembersLayout.vue';
import { useGetMyGroups } from '@/composables/useGetMyGroups.js';
import { updateGroup, deleteGroup } from '@/api/GroupsApi.js';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Group } from '@/types/group.js';

const router = useRouter();
const { groups, fetchGroups } = useGetMyGroups();
const notificationStore = useNotificationStore();
const loading = ref(true);
const menuVisible = ref(false);

// Group members modal state
const showMembersModal = ref(false);
const selectedGroupId = ref<number>(0);
const selectedGroupIsLeader = ref(false);

onMounted(async () => {
  try {
    await fetchGroups();
    await loadNotifications();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
});

const handleMenuClick = () => {
  menuVisible.value = !menuVisible.value;
  console.log('Menu toggled:', menuVisible.value);
};

const toggleTrashVisibility = () => {
  console.log('Long press detected');
  // Add trash visibility toggle logic here
};

const loadNotifications = async () => {
  const userCode = localStorage.getItem('currentUserCode');
  if (userCode) {
    await notificationStore.fetchNotifications(userCode);
  }
};

// Original group handlers
const handleGroupClick = (group: Group) => {
  localStorage.setItem('groupId', String(group.groupId));
  router.push(`/task-manager/${group.groupId}`);
};

const updateGroupHandler = async (groupId: number, name: string, description: string) => {
  const group = groups.value.find(g => g.groupId === groupId);

  if (!group) {
    console.error('Không tìm thấy group với ID:', groupId);
    return;
  }

  try {
    await updateGroup({
      groupId,
      nameOfGroup: name,
      descriptionOfGroup: description,
      isLeader: group.isLeader,
    });
    await fetchGroups();
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Lỗi khi cập nhật:', err.message || error);
  }
};

const deleteGroupHandler = async (groupId: number) => {
  if (confirm('Bạn có chắc muốn xóa nhóm này?')) {
    try {
      await deleteGroup(groupId);
      await fetchGroups();
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Lỗi khi xóa:', err.message || error);
    }
  }
};

const showGroupMembers = (group: Group) => {
  selectedGroupId.value = group.groupId;
  selectedGroupIsLeader.value = group.isLeader;
  showMembersModal.value = true;
};

const closeMembersModal = () => {
  showMembersModal.value = false;
};
</script>

<style scoped>
.mobile-groups-container {
  display: flex;
  flex-direction: column;
  padding: 0 15px;
  height: 100vh;
  background-color: #f9f9f9;
}

.groups-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* Space for footer */
}

.loading-container, .empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #666;
  font-size: 16px;
}

.create-group-button {
  position: fixed;
  bottom: 80px; /* Adjusted to be above the footer */
  left: 50%;
  transform: translateX(-50%);
  background-color: #65c77b;
  color: white;
  border-radius: 30px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.create-group-button span {
  font-weight: 500;
}
</style>
