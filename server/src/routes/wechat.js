import { Router } from 'express'
import db from '../db.js'
import { fetchWeChatArticle } from '../fetchers/sites/wechat.js'
import { ruleSummarize } from '../fetchers/summarize.js'
import { classify, suggestAccountCategory } from '../lib/chain-taxonomy.js'
import { ensureAccount } from './wechat-accounts.js'

const router = Router()

// 服务器行业关键词 —— 命中任一即认为相关
const KEYWORDS = [
  '服务器', '算力', '智算', '数据中心', 'IDC', 'GPU', 'CPU', 'HBM',
  'AI 芯片', 'AI芯片', '云厂商', '国产化', '液冷', '存储',
  'NVIDIA', 'AMD', '英特尔', '华为', '浪潮', '海光', '寒武纪', '昇腾',
  '阿里云', '腾讯云', '字节', 'AWS', 'Azure', '中国移动', '中国联通', '中国电信',
]

function hitKeyword(text = '') {
  return KEYWORDS.some((k) => text.includes(k))
}

// 从多个字段拼一个搜索文本，用于关键词过滤 & 标签抽取
function extractTags(text) {
  const tags = new Set()
  const tagMap = [
    ['服务器', '服务器'], ['GPU', 'GPU'], ['CPU', 'CPU'],
    ['HBM', 'HBM'], ['液冷', '液冷'], ['数据中心', '数据中心'],
    ['算力|智算', '算力'], ['国产化', '国产化'],
    ['NVIDIA', 'NVIDIA'], ['AMD', 'AMD'], ['华为|昇腾', '华为'],
    ['浪潮', '浪潮'], ['阿里云', '阿里云'], ['腾讯云', '腾讯云'],
    ['字节跳动|字节', '字节'], ['中国移动', '中国移动'],
    ['中国联通', '中国联通'], ['中国电信', '中国电信'],
  ]
  for (const [pat, tag] of tagMap) {
    if (new RegExp(pat).test(text)) tags.add(tag)
  }
  return Array.from(tags)
}

// POST /api/wechat/ingest  { urls: ["https://mp.weixin.qq.com/s/xxx", ...] }
router.post('/wechat/ingest', async (req, res) => {
  const urls = Array.isArray(req.body?.urls) ? req.body.urls : []
  if (!urls.length) return res.status(400).json({ error: 'urls[] required' })

  const results = []
  let newAccounts = 0
  let touchedAccounts = 0

  for (const url of urls) {
    const result = { url, ok: false }
    try {
      const article = await fetchWeChatArticle(url)
      const text = `${article.title} ${article.contentText}`

      if (!hitKeyword(text)) {
        result.skipped = 'no keyword hit'
        results.push(result)
        continue
      }

      const summary = ruleSummarize(article.contentHtml, article.contentText)
      const tags = extractTags(text)

      // 用同一套 taxonomy 分类，供前端展示 & 决定公众号 category
      const cls = classify({ title: article.title, summary: article.contentText })

      const inserted = db.upsert('news', {
        guid: url,
        title: article.title,
        summary,
        link: url,
        source: article.account ? `公众号 · ${article.account}` : '公众号',
        author: article.author || '',
        published_at:
          article.publishedAt || new Date().toISOString().slice(0, 10),
        tags,
        content: article.contentText.slice(0, 5000),
        chainLayer: cls.layer,
        chainSub: cls.sub,
      })

      // 自动把公众号加入追踪清单（已存在则更新最近抓文）
      let accountResult = { added: false, item: null }
      if (article.account) {
        accountResult = ensureAccount(article.account, {
          category: suggestAccountCategory(cls),
          tags,
          priority: 'mid',
          articleTitle: article.title,
        })
        if (accountResult.added) newAccounts += 1
        else touchedAccounts += 1
      }

      result.ok = true
      result.inserted = inserted
      result.title = article.title
      result.account = article.account
      result.classification = {
        layer: cls.layer,
        layerName: cls.layerName,
        sub: cls.sub,
        subName: cls.subName,
      }
      result.accountAdded = accountResult.added
    } catch (e) {
      result.error = e.message
    }
    results.push(result)
  }

  res.json({
    total: urls.length,
    inserted: results.filter((r) => r.inserted).length,
    newAccounts,       // 本次入库新增加入追踪的公众号数量
    touchedAccounts,   // 已在库、这次刷新了 lastIngestAt 的公众号数量
    results,
  })
})

// GET /api/wechat/ingest?url=... —— 方便用浏览器地址栏测试
router.get('/wechat/ingest', async (req, res) => {
  const url = String(req.query.url || '')
  if (!url) return res.status(400).json({ error: 'url required' })
  req.body = { urls: [url] }
  return router.handle({ ...req, method: 'POST', body: { urls: [url] } }, res, () => {})
})

export default router
