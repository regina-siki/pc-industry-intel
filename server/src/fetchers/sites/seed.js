// 种子数据适配器 —— 从 data/seed-tenders.json 导入手工维护的重大采购事件
// 用途：手工录入公开新闻/公告里的重大采购，作为爬虫的补充与兜底

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_PATH = path.join(__dirname, '../../../data/seed-tenders.json')

export default {
  name: 'seed-manual',

  async run() {
    if (!fs.existsSync(SEED_PATH)) return []
    try {
      const list = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'))
      return Array.isArray(list) ? list : []
    } catch (e) {
      console.warn('[seed] parse failed:', e.message)
      return []
    }
  },
}
