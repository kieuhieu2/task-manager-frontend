<template>
  <HeaderOnly></HeaderOnly>
  <div class="group-container">
    <div
      v-for="group in groups"
      :key="group.groupId"
      class="group-item"
    >
      <div v-if="editingGroupId === group.groupId">
        <input v-model="editedName" class="edit-input" />
        <textarea v-model="editedDescription" class="edit-textarea"></textarea>
        <div class="action-buttons">
          <button @click="saveEdit(group.groupId)" class="save-button">Lưu</button>
          <button @click="editingGroupId = null" class="cancel-button">Hủy</button>
        </div>
      </div>
      <div v-else>
        <button class="group-button">
          {{ group.nameOfGroup }}
        </button>
        <p class="group-description">{{ group.descriptionOfGroup }}</p>
        <div class="action-buttons" v-if="group.isLeader">
          <button @click="startEditing(group)" class="edit-button">Sửa</button>
          <button @click="deleteGroupHandler(group.groupId)" class="delete-button">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderOnly from '@/layouts/HeaderOnly/headerOnly.vue'
import { useGetMyGroups } from '@/composables/useGetMyGroups.js'
import { onMounted, ref } from 'vue'
import { updateGroup, deleteGroup } from '@/api/getMyGroups.js'
import type { Group } from '@/types/group.js'
import { useGetMyGroupsStore } from '@/stores/getMyGroups.js'

const { groups, fetchGroups } = useGetMyGroups();
const editingGroupId = ref<number | null>(null);
const editedName = ref('');
const editedDescription = ref('');

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
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);
  }
};

const deleteGroupHandler = async (groupId: number) => {
  if (confirm('Bạn có chắc muốn xóa nhóm này?')) {
    try {
      await deleteGroup(groupId);
      fetchGroups(); // Refresh danh sách
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
    }
  }
};
</script>

<style scoped lang="scss">
@use './getMyGroup.module.scss';
</style>
