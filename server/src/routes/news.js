import { Router } from 'express'
import db from '../db.js'
import { CHAIN_TAXONOMY, classify } from '../lib/chain-taxonomy.js'

const router = Router()

function toClientNews(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content || '',
    author: row.author || '',
    link: row.link,
    source: row.source,
    publishedAt: (row.published_at || '').slice(0, 10),
    tags: Array.isArray(row.tags) ? row.tags : [],
  }
}

router.get('/news', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(50, Number(req.query.pageSize) || 10)
  const q = String(req.query.q || '').trim().toLowerCase()
  const tag = String(req.query.tag || '').trim()
  const layer = String(req.query.layer || '').trim()

  const result = db.query('news', {
    where: (r) => {
      if (q && !((r.title || '').toLowerCase().includes(q) ||
                 (r.summary || '').toLowerCase().includes(q))) return false
      if (tag && !(r.tags || []).includes(tag)) return false
      if (layer) {
        const cls = classify(r)
        if (cls.layer !== layer) return false
      }
      return true
    },
    sort: (a, b) => (b.published_at || '').localeCompare(a.published_at || ''),
    offset: (page - 1) * pageSize,
    limit: pageSize,
  })

  res.json({ total: result.total, list: result.list.map(toClientNews) })
})

router.get('/news/:id', (req, res) => {
  const row = db.findById('news', req.params.id)
  if (!row) return res.status(404).json({ message: 'not found' })
  res.json(toClientNews(row))
})

// 资讯统计：总数 / 最新入库时间 / 最新发布时间 / 按来源分布
router.get('/news-stats', (_req, res) => {
  const all = db.query('news', {
    sort: (a, b) => (b.published_at || '').localeCompare(a.published_at || ''),
  })

  const bySource = {}
  let latestFetched = ''
  let latestPublished = ''
  for (const r of all.list) {
    const src = r.source || '未知'
    bySource[src] = (bySource[src] || 0) + 1
    if ((r.fetched_at || '') > latestFetched) latestFetched = r.fetched_at || ''
    if ((r.published_at || '') > latestPublished) latestPublished = r.published_at || ''
  }

  res.json({
    total: all.total,
    // 若历史数据未记录 fetched_at，兜底用最新 published_at
    latestFetchedAt: latestFetched || latestPublished || null,
    latestPublishedAt: latestPublished || null,
    bySource: Object.entries(bySource)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
  })
})

// —— 结构化视图：按产业链分层聚合，附最近一段时间的动态摘要 ——
router.get('/news-structured', (req, res) => {
  const days = Math.min(60, Number(req.query.days) || 14)
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const all = db.query('news', {
    where: (r) => (r.published_at || '').slice(0, 10) >= cutoff,
    sort: (a, b) => (b.published_at || '').localeCompare(a.published_at || ''),
  })

  const layers = CHAIN_TAXONOMY.map((layer) => ({
    id: layer.id,
    name: layer.name,
    subCategories: layer.subCategories.map((sub) => ({
      key: sub.key,
      name: sub.name,
      articles: [],
    })),
    total: 0,
  }))

  for (const row of all.list) {
    const cls = classify(row)
    const layer = layers.find((l) => l.id === cls.layer)
    if (!layer) continue
    const sub = layer.subCategories.find((s) => s.key === cls.sub)
    if (!sub) continue
    sub.articles.push(toClientNews(row))
    layer.total += 1
  }

  // 顶部总结：三行 —— 上游/中游/下游 各自条数 + 最新一条标题
  const topHighlights = layers
    .filter((l) => l.id !== 'other')
    .map((l) => {
      const allArticles = l.subCategories.flatMap((s) => s.articles)
      allArticles.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
      return {
        layerId: l.id,
        layerName: l.name,
        count: l.total,
        latest: allArticles[0] || null,
        subBreakdown: l.subCategories
          .map((s) => ({ name: s.name, count: s.articles.length }))
          .filter((x) => x.count > 0),
      }
    })

  res.json({
    windowDays: days,
    totalArticles: all.total,
    layers,
    topHighlights,
  })
})

// —— 近 N 天资讯 × 产业链影响：首页板块 ——
// 输出：每层最近条数 / 环比变化 / 代表性新闻 / 子分类分布 / 一句话方向标记
router.get('/news-chain-impact', (req, res) => {
  const days = Math.min(30, Math.max(1, Number(req.query.days) || 7))
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const cutoffNow = new Date(now - days * dayMs).toISOString().slice(0, 10)
  const cutoffPrev = new Date(now - 2 * days * dayMs).toISOString().slice(0, 10)

  const allInWindow = db.query('news', {
    where: (r) => (r.published_at || '').slice(0, 10) >= cutoffNow,
    sort: (a, b) => (b.published_at || '').localeCompare(a.published_at || ''),
  })

  const prevWindow = db.query('news', {
    where: (r) => {
      const d = (r.published_at || '').slice(0, 10)
      return d >= cutoffPrev && d < cutoffNow
    },
  })

  const prevCountByLayer = {}
  for (const row of prevWindow.list) {
    const cls = classify(row)
    prevCountByLayer[cls.layer] = (prevCountByLayer[cls.layer] || 0) + 1
  }

  const layers = CHAIN_TAXONOMY.filter((l) => l.id !== 'other').map((layer) => ({
    id: layer.id,
    name: layer.name,
    count: 0,
    prevCount: prevCountByLayer[layer.id] || 0,
    articles: [],
    subCategories: layer.subCategories.map((sub) => ({
      key: sub.key,
      name: sub.name,
      count: 0,
      latest: null,
      articles: [],
    })),
  }))

  for (const row of allInWindow.list) {
    const cls = classify(row)
    if (cls.layer === 'other') continue
    const layer = layers.find((l) => l.id === cls.layer)
    if (!layer) continue
    layer.count += 1
    const sub = layer.subCategories.find((s) => s.key === cls.sub)
    if (sub) {
      sub.count += 1
      if (!sub.latest) sub.latest = toClientNews(row)
      if (sub.articles.length < 3) sub.articles.push(toClientNews(row))
    }
    if (layer.articles.length < 5) layer.articles.push(toClientNews(row))
  }

  const daysArg = req.query.days || 7
  // 影响方向的启发式判定：数量上升 / 下降 vs 前 N 天
  for (const layer of layers) {
    const delta = layer.count - layer.prevCount
    layer.trend =
      layer.prevCount === 0 && layer.count > 0
        ? 'up'
        : delta > Math.max(1, layer.prevCount * 0.2)
          ? 'up'
          : delta < -Math.max(1, layer.prevCount * 0.2)
            ? 'down'
            : 'flat'
    // 前窗口过小时（< 3）不显示百分比，避免出现 1500% 这种噪音
    layer.deltaPct =
      layer.prevCount >= 3
        ? Math.round((delta / layer.prevCount) * 100)
        : null
    layer.deltaLabel =
      layer.prevCount >= 3
        ? `${layer.deltaPct >= 0 ? '+' : ''}${layer.deltaPct}% vs 上 ${daysArg} 天`
        : layer.prevCount === 0
          ? '新出现'
          : `+${delta} 条`
    layer.subCategories = layer.subCategories
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }

  // —— 动态摘要：从每层最新新闻标题合成关键动态 ——
  // 每层：按子分类 top 3-4 条，每条给出 "[子分类] 简明标题 → 影响关键词"
  const summaryBullets = layers.map((layer) => {
    const bullets = []
    for (const sub of layer.subCategories) {
      for (const a of sub.articles.slice(0, 2)) {
        bullets.push({
          subName: sub.name,
          title: a.title,
          source: a.source,
          publishedAt: a.publishedAt,
          id: a.id,
        })
        if (bullets.length >= 4) break
      }
      if (bullets.length >= 4) break
    }
    return {
      layerId: layer.id,
      layerName: layer.name,
      trend: layer.trend,
      count: layer.count,
      bullets,
    }
  })

  // —— 整体产品动态：从下游云厂商 + 中游 OEM 新闻取近 4 条 ——
  const productBullets = []
  for (const layer of layers) {
    for (const a of layer.articles.slice(0, 2)) {
      productBullets.push({
        layerName: layer.name,
        title: a.title,
        source: a.source,
        publishedAt: a.publishedAt,
        id: a.id,
      })
      if (productBullets.length >= 5) break
    }
    if (productBullets.length >= 5) break
  }

  res.json({
    windowDays: days,
    generatedAt: new Date(now).toISOString().slice(0, 16).replace('T', ' '),
    totalArticles: allInWindow.total,
    layers,
    summaryBullets,
    productBullets,
  })
})

export default router
