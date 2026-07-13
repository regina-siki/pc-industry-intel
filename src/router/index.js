import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsView.vue'),
    meta: { title: '行业资讯' },
  },
  {
    path: '/news/:id',
    name: 'news-detail',
    component: () => import('@/views/NewsDetailView.vue'),
    meta: { title: '资讯详情' },
  },
  {
    path: '/supply-chain',
    name: 'supply-chain',
    component: () => import('@/views/SupplyChainView.vue'),
    meta: { title: '产业链图谱' },
  },
  {
    path: '/companies',
    name: 'companies',
    component: () => import('@/views/CompaniesView.vue'),
    meta: { title: '公司 / 产品库' },
  },
  {
    path: '/wechat',
    name: 'wechat',
    component: () => import('@/views/WeChatAccountsView.vue'),
    meta: { title: '公众号追踪' },
  },
  {
    path: '/product',
    name: 'product',
    component: () => import('@/views/ProductView.vue'),
    meta: { title: '产品趋势' },
  },
  {
    path: '/cost',
    name: 'cost',
    component: () => import('@/views/CostView.vue'),
    meta: { title: '成本 · BOM' },
  },
  {
    path: '/segments',
    name: 'segments',
    component: () => import('@/views/CustomerSegmentsView.vue'),
    meta: { title: '客户细分' },
  },
  {
    path: '/match',
    name: 'match',
    component: () => import('@/views/UserMatchView.vue'),
    meta: { title: '用户匹配矩阵' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} · ServerInsight`
    : 'ServerInsight'
})

export default router
