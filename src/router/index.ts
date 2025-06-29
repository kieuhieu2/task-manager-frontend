import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { permissions } from '@/router/permissions.js';
import LoginPage from '@/views/LoginPage.vue';
import GetMyGroups from '@/views/GetMyGroups.vue';
import TaskManager from '@/views/TaskManager.vue';

const   routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  {
    path: '/login',
    name: 'loginPage',
    component: LoginPage,
  },
  {
    path: "/get-my-groups",
    name: 'getMyGroups',
    component: GetMyGroups,
  },
  {
    path: '/task-manager/:groupId',
    name: 'taskManager',
    component: TaskManager
  },
  ];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Nếu route không yêu cầu auth, cho phép đi tiếp
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  // Nếu không có token hoặc role, chuyển về login
  if (!token || !userRole) {
    next('/login');
    return;
  }

  // Kiểm tra xem role có tồn tại trong permissions không
  if (!permissions[userRole]) {
    next('/login'); // Role không hợp lệ
    return;
  }

  // Kiểm tra xem path đích có trong danh sách quyền của role không
  const allowedPaths = permissions[userRole];
  if (!allowedPaths.includes(to.path)) {
    next('/login'); // Role không có quyền truy cập, chuyển về login
    return;
  }

  // Nếu hợp lệ, cho phép đi tiếp
  next();
});


export default router;
