import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';
import RegistryConfig from './RegistryConfig.vue';
import DirectPull from './DirectPull.vue';
import ImageSearch from './ImageSearch.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Main', component: ImageSearch },
  { path: '/direct', name: 'DirectPull', component: DirectPull },
  { path: '/config', name: 'RegistryConfig', component: RegistryConfig }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫，未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;
