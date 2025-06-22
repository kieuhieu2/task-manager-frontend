<script setup lang="ts">
import { ref } from 'vue';
import { createGroup } from '@/api/GroupsApi.js';
import { getFullNameByUserCode} from '@/api/userApi.js'

interface GroupCreate {
  nameOfGroup: string;
  faculty: string;
  department: string;
  memberCodes: { userCode: string; fullName: string }[];
  leaderCodes: { leaderCode: string; fullName: string }[];
  descriptionOfGroup: string;
}

interface GroupCreatePayload {
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

const addMemberCode = async () => {
  const userCode = newMemberCode.value.trim();
  if (!userCode) return;

  try {
    const fullName = await getFullNameByUserCode(userCode);
    group.value.memberCodes.push({ userCode, fullName });
    newMemberCode.value = '';
  } catch (err: any) {
    error.value = err.message || 'Không thể thêm mã thành viên';
    console.error('Lỗi khi thêm mã thành viên:', err);
  }
};

const addLeaderCode = async () => {
  const userCode = newLeaderCode.value.trim();
  if (!userCode) return;

  try {
    const fullName = await getFullNameByUserCode(userCode);
    group.value.leaderCodes.push({ leaderCode: userCode, fullName });
    newLeaderCode.value = '';
  } catch (err: any) {
    error.value = err.message || 'Không thể thêm mã trưởng nhóm';
    console.error('Lỗi khi thêm mã trưởng nhóm:', err);
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
    const payload: GroupCreatePayload = {
      nameOfGroup: group.value.nameOfGroup,
      faculty: group.value.faculty,
      department: group.value.department,
      descriptionOfGroup: group.value.descriptionOfGroup,
      memberCodes: group.value.memberCodes.map(member => member.userCode),
      leaderCodes: group.value.leaderCodes.map(leader => leader.leaderCode),
    };

    await createGroup(payload);
    // router.push({ name: 'GroupList' });
  } catch (err: any) {
    error.value = err.message || 'Không thể tạo nhóm mới';
    console.error('Lỗi khi tạo nhóm:', err);
  }
};

const handleEnterAddMember = (event: KeyboardEvent) => {
  event.preventDefault();
  addMemberCode();
};

const handleAddLeaderCode = (event: KeyboardEvent) => {
  event.preventDefault();
  addLeaderCode();
}

</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="create-header">
        <h2>Tạo nhóm mới</h2>
        <button @click="$emit('close')" class="close-btn">[x]</button>
      </div>

      <form @submit.prevent="createGroupHandler" class="create-form">
        <div class="form-group">
          <label for="nameOfGroup">Tên nhóm:</label>
          <input v-model="group.nameOfGroup" id="nameOfGroup" type="text" required />
        </div>

        <div class="form-group">
          <label for="faculty">Khoa:</label>
          <input v-model="group.faculty" id="faculty" type="text" required />
        </div>

        <div class="form-group">
          <label for="department">Bộ môn:</label>
          <input v-model="group.department" id="department" type="text" required />
        </div>

        <div class="form-group">
          <label>Mã thành viên:</label>
          <div class="code-input">
            <input v-model="newMemberCode" type="text" placeholder="Nhập mã thành viên" @keydown.enter.prevent="handleEnterAddMember" />
            <button type="button" @click="addMemberCode" class="add-btn">Thêm</button>
          </div>
          <div class="code-list">
            <div v-for="(item, index) in group.memberCodes" :key="index" class="code-item">
              <span>{{ item.fullName }} ({{ item.userCode }})</span>
              <button type="button" @click="removeMemberCode(index)" class="remove-btn">X</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Mã trưởng nhóm:</label>
          <div class="code-input">
            <input v-model="newLeaderCode" type="text" placeholder="Nhập mã trưởng nhóm" @keydown.enter.prevent="handleAddLeaderCode" />
            <button type="button" @click="addLeaderCode" class="add-btn">Thêm</button>
          </div>
          <div class="code-list">
            <div v-for="(item, index) in group.leaderCodes" :key="index" class="code-item">
              <span>{{ item.fullName }} ({{ item.leaderCode }})</span>
              <button type="button" @click="removeLeaderCode(index)" class="remove-btn">X</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Mô tả:</label>
          <textarea v-model="group.descriptionOfGroup" id="description" rows="5"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">Tạo nhóm</button>
          <button type="button" @click="$emit('close')" class="cancel-btn">Hủy</button>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>


<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 80vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.create-header {
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.create-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: red;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

input,
textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.code-input {
  display: flex;
  gap: 0.5rem;
}

.code-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.code-item {
  background: #e9ecef;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-btn {
  background: #dc3545;
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #c82333;
  }
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #218838;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
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
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #5a6268;
  }
}

.error-message {
  color: #dc3545;
  text-align: center;
}
</style>
