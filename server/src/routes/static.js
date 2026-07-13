import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STATIC_PATH = path.join(__dirname, '../../data/static.json')

let cache = null
let cacheMtime = 0

function load() {
  const stat = fs.statSync(STATIC_PATH)
  if (!cache || stat.mtimeMs > cacheMtime) {
    cache = JSON.parse(fs.readFileSync(STATIC_PATH, 'utf-8'))
    cacheMtime = stat.mtimeMs
  }
  return cache
}

const router = Router()

router.get('/kpi', (_req, res) => res.json(load().kpi))
router.get('/insights', (_req, res) => res.json(load().insights))
router.get('/supply-chain', (_req, res) => res.json(load().supplyChain))
router.get('/companies', (req, res) => {
  const category = String(req.query.category || '').trim()
  let list = load().companies
  if (category) list = list.filter((c) => c.category === category)
  res.json(list)
})

export default router
