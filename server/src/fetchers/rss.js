import Parser from 'rss-parser'
import db from '../db.js'
import { rssSources, keywordFilters } from './rss-sources.js'

const parser = new Parser({ timeout: Number(process.env.FETCH_TIMEOUT) || 15000 })

function matchKeyword(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return keywordFilters.some((k) => lower.includes(k.toLowerCase()))
}

function extractSummary(item) {
  const raw = item.contentSnippet || item.summary || item.content || ''
  return String(raw).replace(/\s+/g, ' ').trim().slice(0, 240)
}

// 提取更完整的正文（供详情页展示）
function extractContent(item) {
  // rss-parser 的 content 字段通常带 HTML，contentEncoded 更完整
  const raw =
    item['content:encoded'] ||
    item.contentEncoded ||
    item.content ||
    item.contentSnippet ||
    ''
  // 去脚本 + 保留基本段落结构
  return String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
    .slice(0, 20000) // 单篇上限 20k 字符
}

export async function fetchAllRss() {
  const summary = { total: 0, inserted: 0, sources: [] }

  for (const src of rssSources) {
    const rec = { name: src.name, ok: false, inserted: 0, error: null }
    try {
      const feed = await parser.parseURL(src.url)
      for (const item of feed.items || []) {
        const title = (item.title || '').trim()
        const body = extractSummary(item)
        if (!title) continue
        if (!matchKeyword(`${title} ${body}`)) continue

        const inserted = db.upsert('news', {
          guid: item.guid || item.link || `${src.name}::${title}`,
          title,
          summary: body,
          content: extractContent(item),
          link: item.link || '',
          source: src.name,
          published_at: item.isoDate || item.pubDate || new Date().toISOString(),
          tags: src.tags || [],
        })
        summary.total += 1
        if (inserted) {
          summary.inserted += 1
          rec.inserted += 1
        }
      }
      rec.ok = true
    } catch (e) {
      rec.error = e.message
      console.warn(`[rss] ${src.name} failed:`, e.message)
    }
    summary.sources.push(rec)
  }

  return summary
}
