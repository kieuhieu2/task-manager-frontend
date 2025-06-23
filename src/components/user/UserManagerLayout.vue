<template>
  <div class="user-manager-layout">
    <div class="header-container">
      <h2 class="header-title-user-manager text-2xl font-bold text-center">Quản lý người dùng</h2>
      <button class="close-btn" @click="$emit('close')">[x]</button>
    </div>

    <div class="flex justify-between items-center mb-6 mt-5">
      <button class="create-btn" @click="showCreateUser = true">
        Tạo mới người dùng
      </button>

      <div class="search-container flex items-center gap-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm mã người dùng ..."
          class="search-input"
        />
        <button
          @click="handleSearch"
          class="search-btn"
        >
          Tìm kiếm
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>Mã người dùng</th>
            <th>Họ</th>
            <th>Tên</th>
            <th>Ngày sinh</th>
            <th>Vai trò</th>
            <th>Tài khoản</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-4">Loading...</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="7" class="text-center py-4 text-red-500">{{ error }}</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="7" class="text-center py-4">No users found</td>
          </tr>
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.code }}</td>
            <td>{{ user.firstName || '-' }}</td>
            <td>{{ user.lastName || '-' }}</td>
            <td>{{ user.dob }}</td>
            <td>{{ getRoleNames(user.roles) }}</td>
            <td>{{ user.username || '-' }}</td>
            <td>
              <button
                @click="confirmDelete(user.code, user.firstName, user.lastName)"
                class="delete-btn"
                :disabled="isDeleting === user.code"
              >
                {{ isDeleting === user.code ? 'Đang xóa...' : 'Xóa' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-info">
          Hiển thị {{ users.length }} / {{ totalElements }} người dùng
        </div>
        <div class="pagination-controls">
          <button
            @click="goToPage(currentPage - 1)"
            class="pagination-btn"
            :disabled="!hasPrevious"
          >
            &laquo; Trước
          </button>
          <span class="pagination-page">Trang {{ currentPage + 1 }}/{{ totalPages }}</span>
          <button
            @click="goToPage(currentPage + 1)"
            class="pagination-btn"
            :disabled="!hasNext"
          >
            Sau &raquo;
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- User Details Modal -->
  <UserDetailsLayout
    v-if="showUserDetails"
    :userCode="searchQuery"
    @close="showUserDetails = false"
  />

  <!-- Create User Modal -->
  <CreateUserLayout
    v-if="showCreateUser"
    @close="showCreateUser = false"
    @created="handleUserCreated"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsersByPage, deleteUser } from '@/api/userApi';
import UserDetailsLayout from '@/components/user/UserDetailsLayout.vue';
import CreateUserLayout from '@/components/user/CreateUserLayout.vue';

interface Role {
  name: string;
  description: string;
  permissions: string[];
}

interface User {
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  code: string;
  dob: string | null;
  roles: Role[];
}

const searchQuery = ref('');
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showUserDetails = ref(false);
const isDeleting = ref<string | null>(null);
const showCreateUser = ref(false);

// Pagination state
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);
const pageSize = ref(10);
const hasNext = ref(false);
const hasPrevious = ref(false);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showUserDetails.value = true;
  } else {
    error.value = 'Vui lòng nhập mã người dùng để tìm kiếm';
  }
};

const handleUserCreated = () => {
  // Sau khi tạo người dùng thành công, cập nhật lại danh sách
  fetchUsers();
};

const getRoleNames = (roles: Role[]): string => {
  return roles.map(role => role.name).join(', ');
};

const confirmDelete = (userCode: string, firstName: string | null, lastName: string | null) => {
  const userName = [firstName, lastName].filter(Boolean).join(' ') || userCode;
  if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}" không?`)) {
    handleDeleteUser(userCode);
  }
};

const handleDeleteUser = async (userCode: string) => {
  isDeleting.value = userCode;

  try {
    await deleteUser(userCode);
    alert('Xóa người dùng thành công!');
    // Cập nhật lại danh sách người dùng
    await fetchUsers();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa người dùng';
    alert(`Xóa người dùng thất bại: ${errorMessage}`);
  } finally {
    isDeleting.value = null;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchUsers();
};

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await getUsersByPage(currentPage.value, pageSize.value);
    users.value = result.content;

    // Update pagination state
    totalPages.value = result.totalPages;
    totalElements.value = result.totalElements;
    currentPage.value = result.currentPage;
    pageSize.value = result.pageSize;
    hasNext.value = result.hasNext;
    hasPrevious.value = result.hasPrevious;

    loading.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch users';
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.user-manager-layout {
  width: 90vw;
  height: 90vh;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.header-container {
  position: relative;
  text-align: center;
  margin-bottom: 4.5rem;
}

.header-title-user-manager {
  margin: 0 auto;
  font-size: 2rem;
  font-weight: 500;
}

.search-container {
  margin-right: 20px;
}

.search-input {
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 14px;
}

.search-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #0056b3;
}

.create-btn {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.create-btn:hover {
  background-color: #218838;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.delete-btn:hover {
  background-color: #c82333;
}

.delete-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: red;
  }
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.user-table th,
.user-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.user-table tbody tr {
  transition: background-color 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Pagination styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  color: #718096;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e2e8f0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page {
  color: #718096;
  font-size: 0.875rem;
}
</style>
