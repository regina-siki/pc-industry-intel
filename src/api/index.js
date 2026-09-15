// 数据访问层
// GitHub Pages 静态模式：直接从 public/data/*.json 读取，不走后端 API
// 本地开发模式：可选切换回 /api 代理（需启动 server）

const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true'
const STATIC_DATA_BASE = import.meta.env.BASE_URL + 'data'

async function loadStaticJson(name) {
  const url = `${STATIC_DATA_BASE}/${name}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`static data not found: ${url}`)
  return res.json()
}

// =================== 静态模式实现 ===================

export async function fetchKpi() {
  const s = await loadStaticJson('static')
  return s.kpi || []
}

export async function fetchInsights() {
  const s = await loadStaticJson('static')
  return s.insights || []
}

export async function fetchSupplyChain() {
  const s = await loadStaticJson('static')
  return s.supplyChain || { nodes: [], companies: {} }
}

export async function fetchCompanies({ category = '' } = {}) {
  const s = await loadStaticJson('static')
  let list = s.companies || []
  if (category) list = list.filter((c) => c.category === category)
  return list
}

export async function fetchAiIntel() {
  return loadStaticJson('ai-intel')
}

export async function fetchNews({ page = 1, pageSize = 10, q = '', tag = '', layer = '' } = {}) {
  const data = await loadStaticJson('news')
  let list = data.list || []

  // 搜索过滤
  if (q) {
    const lower = q.toLowerCase()
    list = list.filter((n) =>
      (n.title || '').toLowerCase().includes(lower) ||
      (n.summary || '').toLowerCase().includes(lower)
    )
  }
  // 标签过滤
  if (tag) list = list.filter((n) => (n.tags || []).includes(tag))
  // layer 过滤（静态模式下 layer 由前端 chain-taxonomy 决定，暂不支持）
  // 若需要可从 news-structured 推断或重新生成

  const total = list.length
  const start = (page - 1) * pageSize
  return {
    total,
    list: list.slice(start, start + pageSize),
  }
}

export async function fetchNewsStructured({ days = 14 } = {}) {
  // 静态模式：这个接口返回动态聚合，需要预生成
  // 暂时退化为全量数据由客户端过滤
  const data = await loadStaticJson('news')
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const list = (data.list || []).filter((n) => (n.publishedAt || '') >= cutoff)

  // 避免重复实现后端 classify 逻辑，直接把 raw 给 ChainGraph 组件自己分类
  return {
    windowDays: days,
    totalArticles: list.length,
    rawList: list, // 静态模式特有：把 list 透给前端做分类
  }
}

export async function fetchNewsStats() {
  const data = await loadStaticJson('news')
  const list = data.list || []
  const bySource = {}
  let latestPublished = ''
  for (const n of list) {
    bySource[n.source || '未知'] = (bySource[n.source || '未知'] || 0) + 1
    if ((n.publishedAt || '') > latestPublished) latestPublished = n.publishedAt || ''
  }
  return {
    total: data.total || list.length,
    latestFetchedAt: data.updatedAt || latestPublished,
    latestPublishedAt: latestPublished || null,
    bySource: Object.entries(bySource)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
  }
}

export async function fetchNewsById(id) {
  const data = await loadStaticJson('news')
  const item = (data.list || []).find((n) => String(n.id) === String(id))
  if (!item) throw new Error('not found')
  return item
}

export async function fetchCustomerOrders({ customer = '' } = {}) {
  const data = await loadStaticJson('customers')
  let list = data.orders || []
  if (customer) list = list.filter((o) => o.customer.includes(customer))
  return list
}

// 公众号相关 —— 静态模式下只读，不支持写入

// 公众号相关 —— 静态模式下只读，不支持写入
export async function fetchWeChatAccounts() {
  const data = await loadStaticJson('wechat-accounts')
  return data.accounts || []
}
export async function createWeChatAccount() {
  throw new Error('静态模式不支持写入')
}
export async function updateWeChatAccount() {
  throw new Error('静态模式不支持写入')
}
export async function deleteWeChatAccount() {
  throw new Error('静态模式不支持写入')
}
export async function ingestWeChatUrls() {
  throw new Error('静态模式不支持写入')
}

// 仪表盘数据
export async function fetchProduct() { return loadStaticJson('product') }
export async function fetchPrice() { return loadStaticJson('price') }
export async function fetchCustomerSegments() { return loadStaticJson('customers') }
export async function fetchBom() { return loadStaticJson('bom') }
export async function fetchBomById(id) {
  const data = await loadStaticJson('bom')
  const p = (data.products || []).find((x) => x.id === id)
  if (!p) throw new Error('not found')
  return { ...p, disclaimer: data.disclaimer, updatedAt: data.updatedAt }
}
export async function fetchOverview() { return loadStaticJson('overview') }
export async function fetchNewsSummary() { return loadStaticJson('news-summary') }
export async function fetchMacroPolicy() { return loadStaticJson('macro-policy') }
export async function fetchUserMatch() { return loadStaticJson('user-match') }
export async function fetchProductLifecycle() { return loadStaticJson('product-lifecycle') }

// 近 N 天资讯 x 产业链影响 —— 静态模式下前端自己构建聚合
export async function fetchNewsChainImpact(days = 7) {
  const { buildChainImpact } = await import('@/lib/build-chain-impact.js')
  const data = await loadStaticJson('news')
  return buildChainImpact(data.list || [], days)
}
