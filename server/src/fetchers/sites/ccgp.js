// 中国政府采购网 —— SSR 抓取器
// 一期策略：走关键词搜索接口 + 栏目最新页兜底
//   - 搜索: http://search.ccgp.gov.cn/bxsearch  （偶尔限频，带退避重试）
//   - 栏目: http://www.ccgp.gov.cn/cggg/{zygg|dfgg}/{cggg|zbgg|cjgg}/
// 关键词命中才入库；详情页字段（采购人/金额）留到二期挖

import { fetchHtml, absoluteUrl } from '../http.js'

const KEYWORDS = [
  // 服务器/AI 侧
  '服务器', 'GPU', '算力', '智算', '数据中心', 'IDC',
  '存储阵列', '刀片', '整机柜', '超融合', 'AI 算力',
  // PC 全品类（政府/教育采购常见词）
  '笔记本电脑', '台式电脑', '办公电脑', '便携式计算机', '计算机',
  '一体机', '一体化计算机', '工作站', '显示器', '打印机',
]

// 搜索接口：bidType 1=货物 timeType 1=近一日 5=近半年 6=近一年
const SEARCH_URL = (kw, page = 1) =>
  `http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=${page}&kw=${encodeURIComponent(kw)}&bidType=1&timeType=1`

// 栏目页兜底
const CHANNEL_URLS = [
  'http://www.ccgp.gov.cn/cggg/zygg/zbgg/',
  'http://www.ccgp.gov.cn/cggg/zygg/cggg/',
  'http://www.ccgp.gov.cn/cggg/dfgg/zbgg/',
  'http://www.ccgp.gov.cn/cggg/dfgg/cggg/',
]

function hitKeyword(title) {
  return KEYWORDS.some((k) => title.includes(k))
}

// 通用 <a>+日期 解析（栏目页 & 搜索页结构近似）
function parseList(html, baseUrl) {
  const items = []
  const re =
    /<a[^>]+href="([^"]+\.htm[^"]*)"[^>]*>([^<]{5,200})<\/a>[\s\S]{0,400}?(\d{4}[-.]\d{2}[-.]\d{2})?/g
  let m
  while ((m = re.exec(html)) !== null) {
    const [, href, rawTitle, date] = m
    const title = rawTitle.replace(/\s+/g, ' ').trim()
    if (!title) continue
    // 只保留真正的公告 URL（含 t\d{8}_\d+.htm 或 tYYYYMMDD 模式）
    if (!/t\d{8}_\d+\.htm|t\d{8}_/.test(href)) continue
    items.push({
      title,
      link: absoluteUrl(baseUrl, href),
      publishedAt: date
        ? date.replace(/\./g, '-')
        : new Date().toISOString().slice(0, 10),
    })
  }
  return items
}

function extractCustomer(title) {
  return title
    .replace(/[-—]?(中标|成交|采购)?(公告|结果公告|结果)$/g, '')
    .replace(/(项目|中心|医院|大学|学院|局)[^项目中心医院大学学院局]*$/, '$1')
    .slice(0, 40)
    .trim()
}

function extractType(title) {
  if (/GPU|AI 服务器|AI服务器|智算|算力/.test(title)) return 'AI 服务器 / GPU'
  if (/存储/.test(title)) return '存储'
  if (/数据中心|IDC/.test(title)) return '数据中心'
  if (/服务器/.test(title)) return '服务器'
  if (/笔记本电脑|便携式计算机/.test(title)) return '笔记本电脑'
  if (/台式电脑|办公电脑|台式计算机/.test(title)) return '台式电脑'
  if (/一体机|一体化计算机/.test(title)) return '一体机'
  if (/工作站/.test(title)) return '工作站'
  if (/显示器/.test(title)) return '显示器'
  return 'IT 设备'
}

function inferStatus(link) {
  if (link.includes('/zbgg/')) return '中标'
  if (link.includes('/cggg/')) return '采购公告'
  if (link.includes('/cjgg/')) return '成交'
  return '公告'
}

async function tryFetch(url) {
  try {
    return await fetchHtml(url, { referer: 'http://www.ccgp.gov.cn/' })
  } catch (e) {
    if (e.retryable) {
      // 遇到频控直接跳过该 URL，等下次 cron
      console.warn(`[ccgp] rate limited, skip: ${url}`)
      return null
    }
    throw e
  }
}

export default {
  name: 'ccgp',

  async run() {
    const collected = new Map() // link -> item

    // 1) 关键词搜索（命中率高，但可能被限）
    for (const kw of ['服务器', '数据中心', 'GPU', '算力', '笔记本电脑', '台式电脑', '工作站', '一体机']) {
      const res = await tryFetch(SEARCH_URL(kw))
      if (!res) continue
      for (const it of parseList(res.html, SEARCH_URL(kw))) {
        if (!hitKeyword(it.title)) continue
        collected.set(it.link, it)
      }
    }

    // 2) 栏目页兜底
    for (const url of CHANNEL_URLS) {
      const res = await tryFetch(url)
      if (!res) continue
      for (const it of parseList(res.html, url)) {
        if (!hitKeyword(it.title)) continue
        collected.set(it.link, it)
      }
    }

    return Array.from(collected.values()).map((it) => ({
      guid: it.link,
      customer: extractCustomer(it.title),
      title: it.title,
      period: it.publishedAt,
      scale: '',
      amount: '',
      type: extractType(it.title),
      vendors: [],
      status: inferStatus(it.link),
      link: it.link,
      publishedAt: it.publishedAt,
    }))
  },
}
