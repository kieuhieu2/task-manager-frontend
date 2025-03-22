<style scoped>
@import "tailwindcss";
</style>

<template>
  <HeaderOnly>
    <div class="container" style="background-color: #27ae60; width: 200px">
      <h1 class="text-2xl font-semibold text-white">Test</h1>
    </div>
<!--    <div class="create-user min-h-screen flex items-center justify-center bg-green-300">-->
<!--      <div class="w-full max-w-lg p-6 bg-white rounded-lg shadow-md">-->
<!--        <h2 class="text-2xl font-bold text-center mb-6">Thêm Người Dùng</h2>-->
<!--        <form @submit.prevent="handleCreateUser" class="space-y-4">-->
<!--          <div class="form-group">-->
<!--            <label class="block text-sm font-medium text-gray-700">Username:</label>-->
<!--            <input-->
<!--              v-model="userData.username"-->
<!--              type="text"-->
<!--              required-->
<!--              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="block text-sm font-medium text-gray-700">Password:</label>-->
<!--            <input-->
<!--              v-model="userData.password"-->
<!--              type="password"-->
<!--              required-->
<!--              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="block text-sm font-medium text-gray-700">First Name:</label>-->
<!--            <input-->
<!--              v-model="userData.firstName"-->
<!--              type="text"-->
<!--              required-->
<!--              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="block text-sm font-medium text-gray-700">Last Name:</label>-->
<!--            <input-->
<!--              v-model="userData.lastName"-->
<!--              type="text"-->
<!--              required-->
<!--              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"-->
<!--            />-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="block text-sm font-medium text-gray-700">Date of Birth:</label>-->
<!--            <input-->
<!--              v-model="userData.dob"-->
<!--              type="date"-->
<!--              required-->
<!--              class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"-->
<!--            />-->
<!--          </div>-->

<!--          <button-->
<!--            type="submit"-->
<!--            :disabled="loading"-->
<!--            class="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"-->
<!--          >-->
<!--            Tạo Mới-->
<!--          </button>-->

<!--          <p-->
<!--            v-if="message"-->
<!--            :class="{ 'text-green-500': isSuccess, 'text-red-500': !isSuccess }"-->
<!--            class="text-center mt-2"-->
<!--          >-->
<!--            {{ message }}-->
<!--          </p>-->
<!--        </form>-->

<!--        <div v-if="createdUser" class="user-info mt-8">-->
<!--          <h3 class="text-xl font-semibold text-center mb-4">Người dùng mới tạo</h3>-->
<!--          <div class="overflow-x-auto">-->
<!--            <table class="w-full text-left border-collapse">-->
<!--              <thead>-->
<!--              <tr class="bg-gray-200">-->
<!--                <th class="px-4 py-2 text-sm font-medium text-gray-700">ID</th>-->
<!--                <th class="px-4 py-2 text-sm font-medium text-gray-700">Username</th>-->
<!--                <th class="px-4 py-2 text-sm font-medium text-gray-700">First Name</th>-->
<!--                <th class="px-4 py-2 text-sm font-medium text-gray-700">Last Name</th>-->
<!--                <th class="px-4 py-2 text-sm font-medium text-gray-700">Date of Birth</th>-->
<!--                <th class="px-4 py-2 text-sm font-medium text-gray-700">Roles</th>-->
<!--              </tr>-->
<!--              </thead>-->
<!--              <tbody>-->
<!--              <tr class="border-t">-->
<!--                <td class="px-4 py-2">{{ createdUser.id }}</td>-->
<!--                <td class="px-4 py-2">{{ createdUser.username }}</td>-->
<!--                <td class="px-4 py-2">{{ createdUser.firstName }}</td>-->
<!--                <td class="px-4 py-2">{{ createdUser.lastName }}</td>-->
<!--                <td class="px-4 py-2">{{ createdUser.dob }}</td>-->
<!--                <td class="px-4 py-2">-->
<!--                    <span-->
<!--                      v-for="role in createdUser.roles"-->
<!--                      :key="role.name"-->
<!--                      class="inline-block px-2 py-1 mr-1 bg-primary/10 text-primary rounded-full text-sm"-->
<!--                    >-->
<!--                      {{ role.name }}-->
<!--                    </span>-->
<!--                </td>-->
<!--              </tr>-->
<!--              </tbody>-->
<!--            </table>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </HeaderOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createUser } from './useCreateUser';
import type { User } from '@/types/user.ts'
import HeaderOnly from '@/layouts/HeaderOnly/headerOnly.vue';

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
    createdUser.value = response as User;
    message.value = `Tạo thành công người dùng: ${(response as User).username}`;
    isSuccess.value = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      message.value = error.response.data.message;
    } else {
      message.value = 'Lỗi khi tạo người dùng!';
    }
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};
</script>


