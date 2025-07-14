<template>
  <div class="group-members-mobile-overlay">
    <div class="group-members-mobile">
      <button class="close-button" @click="emitClose">×</button>
      <h2>Thành viên của nhóm</h2>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Tìm kiếm thành viên..."
            class="search-input"
          />
          <button @click="searchUsers" class="search-icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
        </div>
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

      <div v-if="activeTab === 'members'" class="members-content">
        <div v-if="currentUserIsLeader" class="add-member-form">
          <input
            v-model="newMemberCode"
            type="text"
            placeholder="Nhập mã người dùng"
            class="add-input"
          />
          <button @click="addMember" class="add-button">+</button>
        </div>
        <p v-if="addMemberMessage" class="member-message" :class="{ 'member-error': addMemberError }">
          {{ addMemberMessage }}
        </p>

        <div class="members-list">
          <div v-for="member in members" :key="member.userCode" class="member-card">
            <div class="member-info">
              <p class="member-code">{{ member.userCode }}</p>
              <p class="member-name">{{ member.firstName }} {{ member.lastName }}</p>
            </div>
            <div class="member-actions">
              <button
                v-if="currentUserIsLeader"
                @click="confirmRemoveMember(member)"
                class="remove-button"
              >
                Xóa
              </button>
            </div>
          </div>
          <div v-if="members.length === 0" class="no-data">
            Không có thành viên nào
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'leaders'" class="members-content">
        <div v-if="currentUserIsLeader" class="add-member-form">
          <input
            v-model="newLeaderCode"
            type="text"
            placeholder="Nhập mã người dùng"
            class="add-input"
          />
          <button @click="addLeader" class="add-button">+</button>
        </div>
        <p v-if="addLeaderMessage" class="member-message" :class="{ 'member-error': addLeaderError }">
          {{ addLeaderMessage }}
        </p>

        <div class="members-list">
          <div v-for="leader in leaders" :key="leader.userCode" class="member-card">
            <div class="member-info">
              <p class="member-code">{{ leader.userCode }}</p>
              <p class="member-name">{{ leader.firstName }} {{ leader.lastName }}</p>
            </div>
            <div class="member-actions">
              <button
                v-if="currentUserCode === leader.userCode"
                @click="confirmRemoveLeader(leader)"
                class="remove-button"
              >
                Xóa
              </button>
            </div>
          </div>
          <div v-if="leaders.length === 0" class="no-data">
            Không có trưởng nhóm nào
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { getGroupMembers, addUserToGroup, removeUserFromGroup } from '@/api/GroupsApi.js'
import type { GroupMember } from '@/types/group.js'

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

const fetchMembers = async () => {
  try {
    members.value = await getGroupMembers(props.groupId)
    error.value = ''

    leaders.value = members.value.filter(member => member.isLeader)
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e?.message || 'Không thể lấy danh sách thành viên'
  }
}

const searchUsers = () => {
  if (!searchTerm.value.trim()) {
    fetchMembers()
    return
  }

  const term = searchTerm.value.toLowerCase()

  if (activeTab.value === 'members') {
    fetchMembers().then(() => {
      members.value = members.value.filter(member =>
        member.userCode.toLowerCase().includes(term) ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(term)
      )
    })
  } else if (activeTab.value === 'leaders') {
    fetchMembers().then(() => {
      leaders.value = leaders.value.filter(leader =>
        leader.userCode.toLowerCase().includes(term) ||
        `${leader.firstName} ${leader.lastName}`.toLowerCase().includes(term)
      )
    })
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

<style scoped>
.group-members-mobile-overlay {
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

.group-members-mobile {
  position: relative;
  background: #fff;
  padding: 16px;
  width: 95vw;
  height: 90vh;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
}

h2 {
  text-align: center;
  margin: 5px 0 15px;
  font-size: 18px;
}

.search-container {
  margin-bottom: 15px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  width: 100%;
}

.search-icon-button {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  padding: 5px;
  color: #666;
  cursor: pointer;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}

.tab-button {
  flex: 1;
  padding: 10px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.tab-button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.members-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.add-member-form {
  display: flex;
  margin-bottom: 10px;
  gap: 8px;
}

.add-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
}

.add-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #28a745;
  color: white;
  border: none;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.member-message {
  font-size: 13px;
  color: #28a745;
  margin: 5px 0;
}

.member-error {
  color: #dc3545;
}

.members-list {
  flex: 1;
  overflow-y: auto;
}

.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.member-info {
  flex: 1;
}

.member-code {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #444;
}

.member-name {
  margin: 2px 0 0;
  font-size: 13px;
  color: #666;
}

.member-actions {
  display: flex;
}

.remove-button {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
}

.error {
  color: #dc3545;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px 0;
  font-size: 14px;
}
</style>
