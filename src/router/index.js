import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'supply-chain',
    component: () => import('@/views/SupplyChainView.vue'),
    meta: { title: '上下游供应链' },
  },
  {
    path: '/product',
    name: 'product',
    component: () => import('@/views/ProductView.vue'),
    meta: { title: '产品' },
  },
  {
    path: '/customer',
    name: 'customer',
    component: () => import('@/views/CustomerView.vue'),
    meta: { title: '运营策略' },
  },
  {
    path: '/news/:id',
    name: 'news-detail',
    component: () => import('@/views/NewsDetailView.vue'),
    meta: { title: '资讯详情' },
  },
  {
    path: '/wechat',
    name: 'wechat',
    component: () => import('@/views/WeChatAccountsView.vue'),
    meta: { title: '公众号追踪' },
  },
  // 兼容旧链接：从其它页面/书签跳过来时优雅回到新页
  { path: '/home', redirect: '/' },
  { path: '/news', redirect: '/' },
  { path: '/cost', redirect: '/' },
  { path: '/supply-chain', redirect: '/' },
  { path: '/segments', redirect: '/customer' },
  { path: '/match', redirect: '/customer' },
  { path: '/companies', redirect: '/' },
]

const router = createRouter({
  // GitHub Pages 静态托管：hash 模式确保刷新后直达路由不会 404
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} · PCInsight`
    : 'PCInsight'
})

export default router
