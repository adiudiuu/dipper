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
    meta: { title: '七政 · 历象 · 授时 · 节气' }
  },
  {
    path: '/butiange',
    name: 'butiange',
    component: () => import('../views/BuTianGeView.vue'),
    meta: { title: '七政 · 步天歌' }
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: () => import('../views/TimelineView.vue'),
    meta: { title: '七政 · 天文史时间线' }
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
