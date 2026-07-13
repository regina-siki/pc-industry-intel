// 框架阶段：用 mock 数据驱动 UI；后续替换为真实接口或爬虫服务即可。
// 切换方式：在 .env 中设置 VITE_USE_MOCK=false，并在 http.js 中接入真实 baseURL。

import {
  mockNews,
  mockSupplyChain,
  mockCustomerOrders,
  mockCompanies,
  mockKpi,
  mockInsights,
} from '@/mock/data'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export async function fetchKpi() {
  if (USE_MOCK) {
    await delay()
    return mockKpi
  }
  return http.get('/kpi')
}

export async function fetchInsights() {
  if (USE_MOCK) {
    await delay()
    return mockInsights
  }
  return http.get('/insights')
}

export async function fetchNews({ page = 1, pageSize = 10, q = '', tag = '', layer = '' } = {}) {
  if (USE_MOCK) {
    await delay()
    let list = mockNews
    if (q) list = list.filter((n) => n.title.includes(q) || n.summary.includes(q))
    if (tag) list = list.filter((n) => n.tags.includes(tag))
    return {
      total: list.length,
      list: list.slice((page - 1) * pageSize, page * pageSize),
    }
  }
  return http.get('/news', { params: { page, pageSize, q, tag, layer } })
}

export async function fetchNewsStructured({ days = 14 } = {}) {
  return http.get('/news-structured', { params: { days } })
}

// 资讯统计：条数、最新入库时间、来源分布
export async function fetchNewsStats() {
  return http.get('/news-stats')
}

export async function fetchNewsById(id) {
  if (USE_MOCK) {
    await delay()
    return mockNews.find((n) => String(n.id) === String(id))
  }
  return http.get(`/news/${id}`)
}

export async function fetchSupplyChain() {
  if (USE_MOCK) {
    await delay()
    return mockSupplyChain
  }
  return http.get('/supply-chain')
}

export async function fetchCustomerOrders({ customer = '' } = {}) {
  if (USE_MOCK) {
    await delay()
    let list = mockCustomerOrders
    if (customer) list = list.filter((o) => o.customer.includes(customer))
    return list
  }
  return http.get('/customer-orders', { params: { customer } })
}

export async function fetchCompanies({ category = '' } = {}) {
  if (USE_MOCK) {
    await delay()
    let list = mockCompanies
    if (category) list = list.filter((c) => c.category === category)
    return list
  }
  return http.get('/companies', { params: { category } })
}

// 粘贴公众号文章链接批量入库
// urls: string[]（每行一个 mp.weixin.qq.com/s/... 链接）
export async function ingestWeChatUrls(urls) {
  return http.post('/wechat/ingest', { urls })
}

// 公众号追踪清单
export async function fetchWeChatAccounts() {
  return http.get('/wechat/accounts')
}
export async function createWeChatAccount(data) {
  return http.post('/wechat/accounts', data)
}
export async function updateWeChatAccount(name, patch) {
  return http.patch(`/wechat/accounts/${encodeURIComponent(name)}`, patch)
}
export async function deleteWeChatAccount(name) {
  return http.delete(`/wechat/accounts/${encodeURIComponent(name)}`)
}

// 仪表盘数据
export async function fetchProduct() { return http.get('/product') }
export async function fetchPrice() { return http.get('/price') }
export async function fetchCustomerSegments() { return http.get('/customer-segments') }
export async function fetchBom() { return http.get('/bom') }
export async function fetchBomById(id) { return http.get(`/bom/${id}`) }

// 首页概览数据（结构化总结 + 京东建议）
export async function fetchOverview() { return http.get('/overview') }
export async function fetchNewsSummary() { return http.get('/news-summary') }
export async function fetchMacroPolicy() { return http.get('/macro-policy') }
export async function fetchUserMatch() { return http.get('/user-match') }
export async function fetchNewsChainImpact(days = 7) { return http.get('/news-chain-impact', { params: { days } }) }
