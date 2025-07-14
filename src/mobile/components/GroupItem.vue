<template>
  <div class="group-item">
    <div v-if="editing" class="group-content">
      <input v-model="editedName" class="edit-input" placeholder="Tên nhóm" />
      <textarea v-model="editedDescription" class="edit-textarea" placeholder="Mô tả nhóm"></textarea>
      <div class="action-buttons">
        <button @click="saveEdit" class="save-button">Lưu</button>
        <button @click="$emit('show-members')" class="members-button">Thành viên</button>
        <button @click="cancelEdit" class="cancel-button">Hủy</button>
      </div>
    </div>
    <div v-else class="group-content">
      <div class="group-header" @click="$emit('group-click')">
        <h3 class="group-name">{{ group.nameOfGroup }}</h3>
      </div>
      <div class="group-description" @click="$emit('group-click')">
        <p>{{ group.descriptionOfGroup }}</p>
      </div>
      <div class="action-buttons-container">
        <div class="action-buttons" v-if="group.isLeader">
          <button @click="startEditing" class="edit-button">Sửa</button>
          <button @click="$emit('show-members')" class="members-button">Thành viên</button>
          <button @click="$emit('delete-group')" class="delete-button">Xóa</button>
        </div>
        <div class="action-buttons" v-else>
          <button @click="$emit('show-members')" class="members-button-solo">Thành viên</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Group } from '@/types/group.js';

const props = defineProps<{
  group: Group;
}>();

const emit = defineEmits<{
  (e: 'update', groupId: number, name: string, description: string): void;
  (e: 'delete-group'): void;
  (e: 'show-members'): void;
  (e: 'group-click'): void;
}>();

const editing = ref(false);
const editedName = ref(props.group.nameOfGroup);
const editedDescription = ref(props.group.descriptionOfGroup);

const startEditing = () => {
  editing.value = true;
  editedName.value = props.group.nameOfGroup;
  editedDescription.value = props.group.descriptionOfGroup;
};

const cancelEdit = () => {
  editing.value = false;
};

const saveEdit = () => {
  emit('update', props.group.groupId, editedName.value, editedDescription.value);
  editing.value = false;
};
</script>

<style scoped>
.group-item {
  background-color: #f5f5f5;
  border-radius: 12px;
  margin: 10px 0;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 525px;
  display: flex;
  flex-direction: column;
}

.group-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #65c77b;
  padding: 10px 15px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.group-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

.group-description {
  font-size: 14px;
  color: #333;
  margin: 10px 0;
  flex-grow: 1;
  overflow-y: auto;
  cursor: pointer;
}

.group-description p {
  margin: 0;
  line-height: 1.4;
}

.action-buttons-container {
  margin-top: auto;
}

.edit-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}

.edit-textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 100px;
  resize: vertical;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.edit-button, .save-button, .cancel-button, .members-button, .delete-button, .members-button-solo {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.edit-button {
  background-color: #28a745;
  color: white;
}

.save-button {
  background-color: #28a745;
  color: white;
}

.members-button, .members-button-solo {
  background-color: #17a2b8;
  color: white;
}

.members-button-solo {
  max-width: none;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}
</style>
