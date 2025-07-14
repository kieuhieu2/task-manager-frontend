<template>
  <div>
    <div v-if="!isMobile" class="modal-overlay">
      <div class="group-members-layout">
        <button class="close-button" @click="emitClose">[x]</button>
        <h2>Thành viên của nhóm</h2>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="search-container">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Nhập mã hoặc tên người dùng..."
            class="search-input"
          />
          <button @click="searchUsers" class="search-button">Tìm kiếm</button>
        </div>

        <div class="tabs">
          <button
            :class="['tab-button', { active: activeTab === 'members' }]"
            @click="activeTab = 'members'"
          >
            Thành viên
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'leaders' }]"
            @click="activeTab = 'leaders'"
          >
            Trưởng nhóm
          </button>
        </div>

        <div v-if="activeTab === 'members'" class="table-container">

          <div v-if="currentUserIsLeader" class="add-member-form">
            <input
              v-model="newMemberCode"
              type="text"
              placeholder="Nhập mã người dùng"
              class="search-input"
            />
            <button @click="addMember" class="add-button">Thêm thành viên</button>
          </div>
          <p v-if="addMemberMessage" class="member-message" :class="{ 'member-error': addMemberError }">
            {{ addMemberMessage }}
          </p>

          <table class="members-table">
            <thead>
              <tr>
                <th>Mã số</th>
                <th>Họ và tên</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in members" :key="member.userCode">
                <td>{{ member.userCode }}</td>
                <td>{{ member.firstName }} {{ member.lastName }}</td>
                <td class="actions">
                  <button
                    v-if="currentUserIsLeader"
                    @click="confirmRemoveMember(member)"
                    class="remove-button"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
              <tr v-if="members.length === 0">
                <td colspan="3" class="no-data">Không có thành viên nào</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'leaders'" class="table-container">
          <div v-if="currentUserIsLeader" class="add-member-form">
            <input
              v-model="newLeaderCode"
              type="text"
              placeholder="Nhập mã người dùng"
              class="search-input"
            />
            <button @click="addLeader" class="add-button">Thêm trưởng nhóm</button>
          </div>
          <p v-if="addLeaderMessage" class="member-message" :class="{ 'member-error': addLeaderError }">
            {{ addLeaderMessage }}
          </p>

          <table class="leaders-table">
            <thead>
              <tr>
                <th>Mã số</th>
                <th>Họ và tên</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leader in leaders" :key="leader.userCode">
                <td>{{ leader.userCode }}</td>
                <td>{{ leader.firstName }} {{ leader.lastName }}</td>
                <td class="actions">
                  <button
                    v-if="currentUserCode === leader.userCode"
                    @click="confirmRemoveLeader(leader)"
                    class="remove-button"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
              <tr v-if="leaders.length === 0">
                <td colspan="3" class="no-data">Không có trưởng nhóm nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <GroupMemberLayoutMobile
      v-else
      :groupId="groupId"
      :isLeader="isLeader"
      @close="emitClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, onBeforeMount, onBeforeUnmount } from 'vue'
import { getGroupMembers, addUserToGroup, removeUserFromGroup } from '@/api/GroupsApi'
import type { GroupMember } from '@/types/group'
import GroupMemberLayoutMobile from '@/mobile/components/GroupMemberLayoutMobile.vue'

const props = defineProps<{
  groupId: number
  isLeader: boolean
}>()

const emit = defineEmits(['close'])
const emitClose = () => emit('close')

const members = ref<GroupMember[]>([])
const leaders = ref<GroupMember[]>([])
const activeTab = ref('members')
const error = ref('')
const searchTerm = ref('')
const currentUserIsLeader = ref(props.isLeader)
const currentUserCode = ref(localStorage.getItem('userCode') || '')
const newMemberCode = ref('')
const addMemberMessage = ref('')
const addMemberError = ref(false)
const newLeaderCode = ref('')
const addLeaderMessage = ref('')
const addLeaderError = ref(false)
const isMobile = ref(false)

const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onBeforeMount(() => {
  checkIfMobile()
  window.addEventListener('resize', checkIfMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIfMobile)
})

const fetchMembers = async () => {
  try {
    members.value = await getGroupMembers(props.groupId);
    error.value = '';

    leaders.value = members.value.filter(member => member.isLeader);

  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e?.message || 'Không thể lấy danh sách thành viên'
  }
}

const searchUsers = () => {
  // Filter users based on search term
  if (!searchTerm.value.trim()) {
    fetchMembers()
    return
  }

  const term = searchTerm.value.toLowerCase()

  if (activeTab.value === 'members') {
    // Filter members
    fetchMembers().then(() => {
      members.value = members.value.filter(member =>
        member.userCode.toLowerCase().includes(term) ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(term)
      )
    })
  } else if (activeTab.value === 'leaders') {
  }
}

const addMember = async () => {
  if (!newMemberCode.value.trim()) {
    addMemberMessage.value = 'Vui lòng nhập mã người dùng'
    addMemberError.value = true
    return
  }

  try {
    await addUserToGroup(props.groupId, newMemberCode.value.trim())
    addMemberMessage.value = 'Thêm thành viên thành công'
    addMemberError.value = false
    newMemberCode.value = ''
    fetchMembers()
  } catch (err: unknown) {
    const e = err as { message?: string }
    addMemberMessage.value = e?.message || 'Không thể thêm thành viên'
    addMemberError.value = true
  }
}

const confirmRemoveMember = async (member: GroupMember) => {
  if (confirm(`Bạn có chắc muốn xóa thành viên ${member.firstName} ${member.lastName}?`)) {
    try {
      await removeUserFromGroup(props.groupId, member.userCode)
      await fetchMembers()
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e?.message || 'Không thể xóa thành viên'
    }
  }
}

const addLeader = async () => {
  if (!newLeaderCode.value.trim()) {
    addLeaderMessage.value = 'Vui lòng nhập mã người dùng'
    addLeaderError.value = true
    return
  }

  try {
    await addUserToGroup(props.groupId, newLeaderCode.value.trim())
    addLeaderMessage.value = 'Thêm trưởng nhóm thành công'
    addLeaderError.value = false
    newLeaderCode.value = ''
    fetchMembers()
  } catch (err: unknown) {
    const e = err as { message?: string }
    addLeaderMessage.value = e?.message || 'Không thể thêm trưởng nhóm'
    addLeaderError.value = true
  }
}

const confirmRemoveLeader = async (leader: GroupMember) => {
  if (confirm(`Bạn có chắc muốn xóa trưởng nhóm ${leader.firstName} ${leader.lastName}?`)) {
    try {
      await removeUserFromGroup(props.groupId, leader.userCode)
      await fetchMembers()
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e?.message || 'Không thể xóa trưởng nhóm'
    }
  }
}

onMounted(() => {
  fetchMembers()
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.group-members-layout {
  position: relative;
  background: #fff;
  padding: 24px;
  width: 80vw;
  height: 80vh;
  max-width: 900px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 10000;
  animation: fadeIn 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.search-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #0056b3;
  }
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;

  &.active {
    color: #007bff;
    border-bottom: 2px solid #007bff;
  }

  &:hover:not(.active) {
    color: #333;
    background-color: #f5f5f5;
  }
}

.table-container {
  overflow-y: auto;
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.actions {
  text-align: center;
}

.remove-button {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
}

.error {
  color: #dc3545;
  margin-bottom: 15px;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
}

.add-member-container {
  margin-top: 20px;
}

.add-member-form {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #218838;
  }
}

.member-message {
  font-size: 14px;
  color: #28a745;
  margin-top: 10px;

  &.member-error {
    color: #dc3545;
  }
}
</style>
