// 公众号追踪清单 —— 从 data/wechat-accounts.json 读写
// 支持 GET 列表 / POST 新增 / DELETE 删除 / PATCH 修改
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.join(__dirname, '../../data/wechat-accounts.json')

export function loadAccounts() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  } catch {
    return []
  }
}
export function saveAccounts(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2))
}

// 幂等地把公众号加入追踪清单。已存在则返回 { added: false, item }
// hints: { category, focus, tags[], priority, note, articleTitle }
export function ensureAccount(name, hints = {}) {
  if (!name) return { added: false, item: null }
  const list = loadAccounts()
  const existing = list.find((a) => a.name === name)
  if (existing) {
    // 累计"最近抓到的一篇标题"作为线索，方便用户看
    if (hints.articleTitle) {
      existing.lastArticle = hints.articleTitle
      existing.lastIngestAt = new Date().toISOString()
      saveAccounts(list)
    }
    return { added: false, item: existing }
  }
  const item = {
    name: String(name).slice(0, 60),
    category: hints.category || '未分类',
    focus: hints.focus || (hints.articleTitle ? `示例文章：${hints.articleTitle.slice(0, 40)}` : ''),
    tags: Array.isArray(hints.tags) ? hints.tags : [],
    priority: hints.priority || 'mid',
    note: hints.note || '自动收录（首次抓文入库时新增）',
    source: 'auto-ingest',
    firstIngestAt: new Date().toISOString(),
    lastIngestAt: new Date().toISOString(),
    lastArticle: hints.articleTitle || '',
  }
  list.push(item)
  saveAccounts(list)
  return { added: true, item }
}

const router = Router()

router.get('/wechat/accounts', (_req, res) => {
  res.json(loadAccounts())
})

router.post('/wechat/accounts', (req, res) => {
  const body = req.body || {}
  if (!body.name) return res.status(400).json({ error: 'name required' })
  const list = loadAccounts()
  if (list.some((a) => a.name === body.name)) {
    return res.status(409).json({ error: 'duplicate name' })
  }
  const item = {
    name: String(body.name).slice(0, 60),
    category: body.category || '未分类',
    focus: body.focus || '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    priority: body.priority || 'mid',
    note: body.note || '',
  }
  list.push(item)
  saveAccounts(list)
  res.json(item)
})

router.patch('/wechat/accounts/:name', (req, res) => {
  const list = loadAccounts()
  const idx = list.findIndex((a) => a.name === req.params.name)
  if (idx < 0) return res.status(404).json({ error: 'not found' })
  list[idx] = { ...list[idx], ...(req.body || {}), name: list[idx].name }
  saveAccounts(list)
  res.json(list[idx])
})

router.delete('/wechat/accounts/:name', (req, res) => {
  const list = loadAccounts()
  const next = list.filter((a) => a.name !== req.params.name)
  if (next.length === list.length) {
    return res.status(404).json({ error: 'not found' })
  }
  saveAccounts(next)
  res.json({ ok: true })
})

export default router
