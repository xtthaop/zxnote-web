import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/login/index.vue'
import Page404 from '@/views/error-page/404.vue'
import Notebook from '@/views/notebook/index.vue'
import Preview from '@/views/preview/index.vue'

export const constantRoutes = [
  {
    path: '/login',
    name: 'LoginPage',
    component: Login,
  },
  {
    path: '/',
    name: 'Notebook',
    component: Notebook,
  },
  {
    path: '/category/:categoryId',
    name: 'Category',
    component: Notebook,
  },
  {
    path: '/category/:categoryId/note/:noteId',
    name: 'Note',
    component: Notebook,
  },
  {
    path: '/category/:categoryId/note/:noteId/preview',
    name: 'Preview',
    component: Preview,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Page404',
    component: Page404,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
})

export default router
