// 轻量 JSON 文件存储 —— 数据量大时切 SQLite/Postgres
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH =
  process.env.DB_PATH && path.isAbsolute(process.env.DB_PATH)
    ? process.env.DB_PATH
    : path.join(__dirname, '..', process.env.DB_PATH || 'data/news.db.json')

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return { news: [], tenders: [] }
  }
}

function writeAll(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// upsert：以 guid 去重，重复则跳过。返回是否插入
function upsert(collection, record) {
  const data = readAll()
  const list = data[collection] || (data[collection] = [])
  if (list.some((r) => r.guid === record.guid)) return false
  list.push({
    ...record,
    id: list.length + 1,
    fetched_at: new Date().toISOString(),
  })
  writeAll(data)
  return true
}

function query(collection, { where, sort, limit, offset } = {}) {
  let list = readAll()[collection] || []
  if (where) list = list.filter(where)
  if (sort) list = list.slice().sort(sort)
  const total = list.length
  if (offset) list = list.slice(offset)
  if (limit) list = list.slice(0, limit)
  return { total, list }
}

function findById(collection, id) {
  return (readAll()[collection] || []).find((r) => String(r.id) === String(id))
}

export default { readAll, writeAll, upsert, query, findById }
