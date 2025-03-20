import { createRouter, createWebHistory } from 'vue-router';
import TablePage from '@pages/TablePage';
import NotFoundPage from '@pages/NotFoundPage';

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
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
