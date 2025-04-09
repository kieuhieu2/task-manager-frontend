<script setup lang="ts">
import { ref } from 'vue';
import { createGroup } from '@/api/getMyGroups.js';

defineEmits(['close']);

interface GroupCreate {
  nameOfGroup: string;
  faculty: string;
  department: string;
  memberCodes: string[];
  leaderCodes: string[];
  descriptionOfGroup: string;
}

const group = ref<GroupCreate>({
  nameOfGroup: '',
  faculty: '',
  department: '',
  memberCodes: [],
  leaderCodes: [],
  descriptionOfGroup: ''
});

const newMemberCode = ref('');
const newLeaderCode = ref('');
const error = ref<string | null>(null);

const addMemberCode = () => {
  if (newMemberCode.value.trim()) {
    group.value.memberCodes.push(newMemberCode.value.trim());
    newMemberCode.value = '';
  }
};

const addLeaderCode = () => {
  if (newLeaderCode.value.trim()) {
    group.value.leaderCodes.push(newLeaderCode.value.trim());
    newLeaderCode.value = '';
  }
};

const removeMemberCode = (index: number) => {
  group.value.memberCodes.splice(index, 1);
};

const removeLeaderCode = (index: number) => {
  group.value.leaderCodes.splice(index, 1);
};

const createGroupHandler = async () => {
  try {
    await createGroup(group.value);
    // router.push({ name: 'GroupList' }); // Chuyển hướng sau khi tạo thành công
  } catch (err: any) {
    error.value = err.message || 'Không thể tạo nhóm mới';
    console.error('Lỗi khi tạo nhóm:', err);
  }
};
</script>

<template>
  <div class="create-container">
    <div class="create-header">
      <h2>Tạo nhóm mới</h2>
      <button @click="$emit('close')" class="close-btn">[X]</button>
    </div>
    <form @submit.prevent="createGroupHandler" class="create-form">
      <div class="form-group">
        <label for="nameOfGroup">Tên nhóm:</label>
        <input
          v-model="group.nameOfGroup"
          id="nameOfGroup"
          type="text"
          required
          placeholder="Nhập tên nhóm"
        />
      </div>

      <div class="form-group">
        <label for="faculty">Khoa:</label>
        <input
          v-model="group.faculty"
          id="faculty"
          type="text"
          required
          placeholder="Nhập tên khoa"
        />
      </div>

      <div class="form-group">
        <label for="department">Bộ môn:</label>
        <input
          v-model="group.department"
          id="department"
          type="text"
          required
          placeholder="Nhập tên bộ môn"
        />
      </div>

      <div class="form-group">
        <label>Mã thành viên:</label>
        <div class="code-input">
          <input
            v-model="newMemberCode"
            type="text"
            placeholder="Nhập mã thành viên"
            @keyup.enter="addMemberCode"
          />
          <button type="button" @click="addMemberCode" class="add-btn">Thêm</button>
        </div>
        <div class="code-list">
          <div v-for="(code, index) in group.memberCodes" :key="index" class="code-item">
            <span>{{ code }}</span>
            <button type="button" @click="removeMemberCode(index)" class="remove-btn">X</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Mã trưởng nhóm:</label>
        <div class="code-input">
          <input
            v-model="newLeaderCode"
            type="text"
            placeholder="Nhập mã trưởng nhóm"
            @keyup.enter="addLeaderCode"
          />
          <button type="button" @click="addLeaderCode" class="add-btn">Thêm</button>
        </div>
        <div class="code-list">
          <div v-for="(code, index) in group.leaderCodes" :key="index" class="code-item">
            <span>{{ code }}</span>
            <button type="button" @click="removeLeaderCode(index)" class="remove-btn">X</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Mô tả:</label>
        <textarea
          v-model="group.descriptionOfGroup"
          id="description"
          placeholder="Nhập mô tả nhóm"
          rows="5"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">Tạo nhóm</button>
        <button type="button" @click="$emit('close')" class="cancel-btn">Hủy</button>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped lang="scss">

.create-container {
  padding: 20px;
  position: relative;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #c82333;
  }
}

/* Giữ nguyên các style khác như trước */
.create-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.code-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
}

.code-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.code-item {
  display: flex;
  align-items: center;
  background-color: #e9ecef;
  padding: 5px 10px;
  border-radius: 4px;
  gap: 5px;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #c82333;
  }
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #5a6268;
  }
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 10px;
}
</style>
