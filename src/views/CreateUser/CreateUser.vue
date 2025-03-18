<template>
  <div class="create-user">
    <h2>Thêm Người Dùng</h2>
    <form @submit.prevent="handleCreateUser">
      <div class="form-group">
        <label>Username:</label>
        <input v-model="userData.username" type="text" required />
      </div>

      <div class="form-group">
        <label>Password:</label>
        <input v-model="userData.password" type="password" required />
      </div>

      <div class="form-group">
        <label>First Name:</label>
        <input v-model="userData.firstName" type="text" required />
      </div>

      <div class="form-group">
        <label>Last Name:</label>
        <input v-model="userData.lastName" type="text" required />
      </div>

      <div class="form-group">
        <label>Date of Birth:</label>
        <input v-model="userData.dob" type="date" required />
      </div>

      <button type="submit" :disabled="loading">Tạo Mới</button>

      <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </p>
    </form>

    <div v-if="createdUser" class="user-info">
      <h3>Người dùng mới tạo</h3>
      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Date of Birth</th>
          <th>Roles</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{{ createdUser.id }}</td>
          <td>{{ createdUser.username }}</td>
          <td>{{ createdUser.firstName }}</td>
          <td>{{ createdUser.lastName }}</td>
          <td>{{ createdUser.dob }}</td>
          <td>
              <span v-for="role in createdUser.roles" :key="role.name" class="role-badge">
                {{ role.name }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createUser } from './useCreateUser';
import type { User } from '@/types/user.ts'


const userData = ref({
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  dob: ''
});

const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);
const createdUser = ref<User | null>(null);

const handleCreateUser = async () => {
  loading.value = true;
  message.value = '';

  try {
    const response = await createUser(userData.value);
    createdUser.value = response;
    message.value = `Tạo thành công người dùng: ${response.username}`;
    isSuccess.value = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    message.value = 'Lỗi khi tạo người dùng!';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
@import './CreateUser.module.scss';
</style>
