import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { permissions } from '@/router/permissions.js';
import CreateUser from '@/views/CreateUser.vue';
import LoginPage from '@/views/LoginPage.vue';
import GetMyGroups from '@/views/GetMyGroups.vue';
import GroupDetails from '@/views/GroupDetails.vue';
import TaskManager from '@/views/TaskManager.vue';

const   routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  {
    path: '/create-user',
    name: 'create-user',
    component: CreateUser,
    meta: { requiresAuth: true, allowedRoles: ['admin'] },
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
    path: '/group-details/:id',
    name: 'groupDetails',
    component: GroupDetails,
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

  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  if (!token || !userRole) {
    next('/login');
    return;
  }

  if (!permissions[userRole]) {
    next('/login');
    return;
  }

  const allowedPaths = permissions[userRole];
  if (!allowedPaths.includes(to.path)) {
    next('/login');
    return;
  }

  next();
});


export default router;
