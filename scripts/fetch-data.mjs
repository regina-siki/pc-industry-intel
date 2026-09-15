#!/usr/bin/env node
// 独立数据抓取脚本 - 用于 GitHub Actions 定时任务
// 不依赖 Express 服务，直接抓取 RSS/招标数据，更新 public/data/news.json
//
// 用法：
//   node scripts/fetch-data.mjs           # 常规抓取（默认）
//   node scripts/fetch-data.mjs --full    # 全量重建（清空重来）

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Parser from 'rss-parser'

import { rssSources, keywordFilters } from '../server/src/fetchers/rss-sources.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const NEWS_PATH = path.join(ROOT, 'public/data/news.json')

const parser = new Parser({ timeout: Number(process.env.FETCH_TIMEOUT) || 15000 })
const isFull = process.argv.includes('--full')

function matchKeyword(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return keywordFilters.some((k) => lower.includes(k.toLowerCase()))
}

function extractSummary(item) {
  const raw = item.contentSnippet || item.summary || item.content || ''
  return String(raw).replace(/\s+/g, ' ').trim().slice(0, 240)
}

function extractContent(item) {
  const raw =
    item['content:encoded'] ||
    item.contentEncoded ||
    item.content ||
    item.contentSnippet ||
    ''
  return String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .trim()
    .slice(0, 20000)
}

function loadExisting() {
  if (isFull) return { list: [], total: 0 }
  try {
    return JSON.parse(fs.readFileSync(NEWS_PATH, 'utf-8'))
  } catch {
    return { list: [], total: 0 }
  }
}

function guidOf(item, srcName) {
  return item.guid || item.link || `${srcName}::${(item.title || '').trim()}`
}

async function main() {
  console.log(`[fetch] mode=${isFull ? 'full' : 'incremental'}, news path=${NEWS_PATH}`)

  const existing = loadExisting()
  const seenGuids = new Set(existing.list.map((n) => n.guid || n.link))
  let maxId = existing.list.reduce((m, n) => Math.max(m, n.id || 0), 0)

  const summary = { total: 0, inserted: 0, skipped: 0, sources: [] }

  for (const src of rssSources) {
    const rec = { name: src.name, ok: false, inserted: 0, skipped: 0, error: null }
    try {
      const feed = await parser.parseURL(src.url)
      for (const item of feed.items || []) {
        const title = (item.title || '').trim()
        const body = extractSummary(item)
        if (!title) continue
        if (!matchKeyword(`${title} ${body}`)) continue

        const guid = guidOf(item, src.name)
        summary.total += 1

        if (seenGuids.has(guid)) {
          summary.skipped += 1
          rec.skipped += 1
          continue
        }

        maxId += 1
        existing.list.push({
          id: maxId,
          title,
          summary: body,
          content: extractContent(item),
          link: item.link || '',
          source: src.name,
          publishedAt: (item.isoDate || item.pubDate || new Date().toISOString()).slice(0, 10),
          tags: src.tags || [],
          guid,
        })
        seenGuids.add(guid)
        summary.inserted += 1
        rec.inserted += 1
      }
      rec.ok = true
    } catch (e) {
      rec.error = e.message
      console.warn(`[rss] ${src.name} failed:`, e.message)
    }
    summary.sources.push(rec)
  }

  // 按发布时间倒序
  existing.list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  existing.total = existing.list.length
  existing.updatedAt = new Date().toISOString().slice(0, 10)

  fs.mkdirSync(path.dirname(NEWS_PATH), { recursive: true })
  fs.writeFileSync(NEWS_PATH, JSON.stringify(existing, null, 2))

  console.log(`[fetch] total=${summary.total} inserted=${summary.inserted} skipped=${summary.skipped}`)
  console.log(`[fetch] news.json size=${existing.total} items`)
  for (const s of summary.sources) {
    console.log(`  - ${s.name}: ok=${s.ok} inserted=${s.inserted} skipped=${s.skipped}${s.error ? ' err=' + s.error : ''}`)
  }
}

main().catch((e) => {
  console.error('[fetch] failed:', e)
  process.exit(1)
})
