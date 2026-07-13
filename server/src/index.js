import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import newsRouter from './routes/news.js'
import customersRouter from './routes/customers.js'
import staticRouter from './routes/static.js'
import wechatRouter from './routes/wechat.js'
import wechatAccountsRouter from './routes/wechat-accounts.js'
import dashboardsRouter from './routes/dashboards.js'
import { fetchAllRss } from './fetchers/rss.js'
import { fetchAllTenders } from './fetchers/tenders.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api', staticRouter)
app.use('/api', newsRouter)
app.use('/api', customersRouter)
app.use('/api', wechatRouter)
app.use('/api', wechatAccountsRouter)
app.use('/api', dashboardsRouter)

// 手动触发抓取（方便调试）：GET /api/fetch/rss  |  /api/fetch/tenders
app.get('/api/fetch/rss', async (_req, res) => {
  try { res.json(await fetchAllRss()) } catch (e) { res.status(500).json({ error: e.message }) }
})
app.get('/api/fetch/tenders', async (_req, res) => {
  try { res.json(await fetchAllTenders()) } catch (e) { res.status(500).json({ error: e.message }) }
})

// —— 生产模式：托管前端静态包 —— //
// 前端 `npm run build` 后把 dist/ 拷到 server/public/
// Docker 镜像里两者一起打包，Express 单进程既服务 API 也服务前端
const PUBLIC_DIR = path.resolve(__dirname, '../public')
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR, { maxAge: '1h', index: false }))
  // SPA 兜底：任何非 /api 的请求返回 index.html
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'))
  })
  console.log(`[server] serving static from ${PUBLIC_DIR}`)
}

const PORT = Number(process.env.PORT) || 8787
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)

  const expr = process.env.FETCH_CRON || '5 * * * *'
  if (cron.validate(expr)) {
    cron.schedule(expr, async () => {
      console.log('[cron] fetch start')
      try {
        const rss = await fetchAllRss()
        const tenders = await fetchAllTenders()
        console.log('[cron] fetch done', { rss, tenders })
      } catch (e) {
        console.warn('[cron] fetch failed', e.message)
      }
    })
    console.log(`[cron] scheduled: ${expr}`)
  }
})
