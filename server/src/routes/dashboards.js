// 通用 JSON 数据源路由：product / price / customers / bom
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadFactory(fileName) {
  const p = path.join(__dirname, '../../data', fileName)
  let cache = null
  let mtime = 0
  return () => {
    const stat = fs.statSync(p)
    if (!cache || stat.mtimeMs > mtime) {
      cache = JSON.parse(fs.readFileSync(p, 'utf-8'))
      mtime = stat.mtimeMs
    }
    return cache
  }
}

const loadProduct = loadFactory('product.json')
const loadPrice = loadFactory('price.json')
const loadCustomers = loadFactory('customers.json')
const loadBom = loadFactory('bom.json')
const loadOverview = loadFactory('overview.json')
const loadNewsSummary = loadFactory('news-summary.json')
const loadMacroPolicy = loadFactory('macro-policy.json')
const loadUserMatch = loadFactory('user-match.json')

const router = Router()

router.get('/product', (_req, res) => res.json(loadProduct()))
router.get('/price', (_req, res) => res.json(loadPrice()))
router.get('/customer-segments', (_req, res) => res.json(loadCustomers()))
router.get('/bom', (_req, res) => res.json(loadBom()))
router.get('/overview', (_req, res) => res.json(loadOverview()))
router.get('/news-summary', (_req, res) => res.json(loadNewsSummary()))
router.get('/macro-policy', (_req, res) => res.json(loadMacroPolicy()))
router.get('/user-match', (_req, res) => res.json(loadUserMatch()))
router.get('/bom/:id', (req, res) => {
  const bom = loadBom()
  const p = (bom.products || []).find((x) => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'not found' })
  res.json({ ...p, disclaimer: bom.disclaimer, updatedAt: bom.updatedAt })
})

export default router
