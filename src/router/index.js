import { createRouter, createWebHistory } from 'vue-router'

/**
 * 路由集中在此。新增页面：
 * 1. 在 src/views/ 建 XxxView.vue
 * 2. 在下方 routes 增加 { path, name, component }
 * 3. Cloudflare Pages 已用 public/_redirects 做 SPA fallback，深链刷新可用
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '七政 · 历象' }
  },
  {
    path: '/butiange',
    name: 'butiange',
    component: () => import('../views/BuTianGeView.vue'),
    meta: { title: '七政 · 列宿' }
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: () => import('../views/TimelineView.vue'),
    meta: { title: '七政 · 羲和' }
  },
  {
    path: '/science',
    name: 'science',
    component: () => import('../views/ScienceView.vue'),
    meta: { title: '七政 · 科普' }
  },
  {
    path: '/topic/jieqi/:slug',
    name: 'jieqi-topic',
    component: () => import('../views/JieqiTopicView.vue'),
    meta: { title: '七政 · 节气专题' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = String(to.meta.title)
})

export default router
