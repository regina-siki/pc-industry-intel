// 招标 / 采购公告抓取。调度所有站点适配器统一入库。
//
// 二期计划（当前尚未实现，需要 Playwright 支持）：
//   - 中国移动 b2b.10086.cn         : SPA + UA 校验
//   - 中国联通 chinaunicombidding.cn: SPA
//   - 中国电信 caigou.chinatelecom.com.cn
// 一期已接入：
//   - 中国政府采购网中央中标公告 (SSR，免登录)

import db from '../db.js'
import ccgp from './sites/ccgp.js'
import seed from './sites/seed.js'

// 抓取顺序：先种子（稳定），后 CCGP（能抓就抓，失败静默）
const adapters = [seed, ccgp]

export async function fetchAllTenders() {
  const summary = { total: 0, inserted: 0, sources: [] }

  for (const ad of adapters) {
    const rec = { name: ad.name, ok: false, inserted: 0, error: null }
    try {
      const items = await ad.run()
      for (const it of items) {
        const inserted = db.upsert('tenders', {
          guid: it.guid || `${ad.name}::${it.link || it.title || it.customer}`,
          customer: it.customer,
          title: it.title || '',
          period: it.period || '',
          scale: it.scale || '',
          amount: it.amount || '',
          type: it.type || '',
          vendors: it.vendors || [],
          status: it.status || '进行中',
          link: it.link || '',
          published_at: it.publishedAt || new Date().toISOString(),
          source: ad.name,
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
      console.warn(`[tender] ${ad.name} failed:`, e.message)
    }
    summary.sources.push(rec)
  }

  return summary
}
