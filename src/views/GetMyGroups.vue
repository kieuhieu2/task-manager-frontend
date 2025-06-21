<template>
  <HeaderOnly></HeaderOnly>
  <div class="group-container">
    <div
      v-for="group in groups"
      :key="group.groupId"
      class="group-item"
    >
      <div 
        v-if="editingGroupId === group.groupId" 
        class="group-content">
        <input v-model="editedName" class="edit-input" />
        <textarea v-model="editedDescription" class="edit-textarea"></textarea>
        <div class="action-buttons">
          <button @click="saveEdit(group.groupId)" class="save-button">Lưu</button>
          <button @click="showGroupMembers(group)" class="members-button">Thành viên</button>
          <button @click="editingGroupId = null" class="cancel-button">Hủy</button>
        </div>
      </div>
      <div v-else class="group-content">
        <button 
          class="group-button" 
          @click="handleGroupClick(group)">
          {{ group.nameOfGroup }}
        </button>
        <p class="group-description">{{ group.descriptionOfGroup }}</p>
        <div class="action-buttons" v-if="group.isLeader">
          <button @click="startEditing(group)" class="edit-button">Sửa</button>
          <button @click="showGroupMembers(group)" class="members-button">Thành viên</button>
          <button @click="deleteGroupHandler(group.groupId)" class="delete-button">Xóa</button>
        </div>
        <div class="action-buttons" v-else>
          <button @click="showGroupMembers(group)" class="members-button">Thành viên</button>
        </div>
      </div>
    </div>
  </div>

  <GroupMembersLayout
    v-if="showMembersModal"
    :groupId="selectedGroupId"
    :isLeader="selectedGroupIsLeader"
    @close="closeMembersModal"
  />
</template>

<script setup lang="ts">
import HeaderOnly from '@/layouts/HeaderOnly/headerOnly.vue'
import GroupMembersLayout from '@/components/GroupMembersLayout.vue'
import { useGetMyGroups } from '@/composables/useGetMyGroups.js'
import { onMounted, ref } from 'vue'
import { updateGroup, deleteGroup } from '@/api/GroupsApi.js'
import type { Group } from '@/types/group.js'
import { useGetMyGroupsStore } from '@/stores/groupsStore.js'
import { useRouter } from 'vue-router'

const { groups, fetchGroups } = useGetMyGroups();
const router = useRouter();
const editingGroupId = ref<number | null>(null);
const editedName = ref('');
const editedDescription = ref('');

// New refs for the members modal
const showMembersModal = ref(false);
const selectedGroupId = ref<number>(0);
const selectedGroupIsLeader = ref(false);

onMounted(() => {
  fetchGroups();
});

const startEditing = (group: Group) => {
  editingGroupId.value = group.groupId;
  editedName.value = group.nameOfGroup;
  editedDescription.value = group.descriptionOfGroup;
};

const saveEdit = async (groupId: number) => {

  const groupStore = useGetMyGroupsStore();
  const group = groupStore.groups.find(g => g.groupId === groupId);

  if (!group) {
    console.error('Không tìm thấy group với ID:', groupId);
    return;
  }

  try {
    await updateGroup({
      groupId,
      nameOfGroup: editedName.value,
      descriptionOfGroup: editedDescription.value,
      isLeader: group.isLeader,
    });
    editingGroupId.value = null;
    fetchGroups();
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Lỗi khi cập nhật:', err.message || error);
  }
};

const deleteGroupHandler = async (groupId: number) => {
  if (confirm('Bạn có chắc muốn xóa nhóm này?')) {
    try {
      await deleteGroup(groupId);
      fetchGroups(); // Refresh danh sách
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Lỗi khi xóa:', err.message || error);
    }
  }
};

// handle show group members modal
const showGroupMembers = (group: Group) => {
  selectedGroupId.value = group.groupId;
  selectedGroupIsLeader.value = group.isLeader;
  showMembersModal.value = true;
};

const closeMembersModal = () => {
  showMembersModal.value = false;
};

const handleGroupClick = (group: Group) => {
  localStorage.setItem('groupId', String(group.groupId));
  router.push(`/task-manager/${group.groupId}`);
};
</script>

<style scoped lang="scss">
.group-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  padding: 20px;
  max-width: 1350px;
  margin: 60px auto;
}

.group-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.group-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 350px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.group-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s ease;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.2;
  min-height: 45px;

  &:hover {
    background-color: #0056b3;
  }
}

.group-description {
  font-size: 14px;
  color: #333;
  margin-top: 10px;
  overflow: auto;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 12;
  line-clamp: 12;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  flex-grow: 1;
}

.action-buttons {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

.action-buttons button + button {
  margin-left: 10px;
}

.edit-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
}

.members-button {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #138496;
  }
}

.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #c82333;
  }
}

.save-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #5a6268;
  }
}

.edit-input {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.edit-textarea {
  width: 100%;
  height: 230px;
  padding: 5px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  resize: vertical;
  flex-grow: 1;
}
</style>
