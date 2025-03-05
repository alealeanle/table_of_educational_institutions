import { createRouter, createWebHistory } from 'vue-router';
import TablePage from '@pages/TablePage';

const routes = [
  {
    path: '/',
    redirect: '/table',
  },
  {
    path: '/table',
    name: 'Table',
    component: TablePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
