// 前端在静态模式下从 raw news list 构建 chain-impact 聚合
// 等价于后端 /api/news-chain-impact 的逻辑

import { CHAIN_TAXONOMY, classify } from './chain-taxonomy.js'

export function buildChainImpact(newsList, days = 7) {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const cutoffNow = new Date(now - days * dayMs).toISOString().slice(0, 10)
  const cutoffPrev = new Date(now - 2 * days * dayMs).toISOString().slice(0, 10)

  const inWindow = (d) => d >= cutoffNow
  const inPrev = (d) => d >= cutoffPrev && d < cutoffNow

  const allInWindow = newsList
    .filter((n) => inWindow(n.publishedAt || ''))
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  const prevWindow = newsList.filter((n) => inPrev(n.publishedAt || ''))

  const prevCountByLayer = {}
  for (const row of prevWindow) {
    const cls = classify({ title: row.title, summary: row.summary })
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

  for (const row of allInWindow) {
    const cls = classify({ title: row.title, summary: row.summary })
    if (cls.layer === 'other') continue
    const layer = layers.find((l) => l.id === cls.layer)
    if (!layer) continue
    layer.count += 1
    const sub = layer.subCategories.find((s) => s.key === cls.sub)
    if (sub) {
      sub.count += 1
      if (!sub.latest) sub.latest = row
      if (sub.articles.length < 3) sub.articles.push(row)
    }
    if (layer.articles.length < 5) layer.articles.push(row)
  }

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
    layer.deltaPct =
      layer.prevCount >= 3
        ? Math.round((delta / layer.prevCount) * 100)
        : null
    layer.deltaLabel =
      layer.prevCount >= 3
        ? `${layer.deltaPct >= 0 ? '+' : ''}${layer.deltaPct}% vs 上 ${days} 天`
        : layer.prevCount === 0
          ? '新出现'
          : `+${delta} 条`
    layer.subCategories = layer.subCategories
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }

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

  return {
    windowDays: days,
    generatedAt: new Date(now).toISOString().slice(0, 16).replace('T', ' '),
    totalArticles: allInWindow.length,
    layers,
    summaryBullets,
    productBullets,
  }
}
