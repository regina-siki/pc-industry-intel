import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/customer-orders', (req, res) => {
  const customer = String(req.query.customer || '').trim()

  const { list } = db.query('tenders', {
    where: (r) => (customer ? String(r.customer || '').includes(customer) : true),
    sort: (a, b) => (b.published_at || '').localeCompare(a.published_at || ''),
  })

  res.json(
    list.map((r) => ({
      customer: r.customer,
      title: r.title || '',
      period: r.period,
      scale: r.scale,
      amount: r.amount,
      type: r.type,
      vendors: Array.isArray(r.vendors) ? r.vendors : [],
      status: r.status,
      link: r.link,
      source: r.source || '',
    })),
  )
})

export default router
