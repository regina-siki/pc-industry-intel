// 通用抓取工具：控制 UA / Referer / 频率，供各站适配器共用

const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const RATE_MS = Number(process.env.FETCH_RATE_MS) || 2000

let lastFetchAt = 0

export async function fetchHtml(url, { referer, headers = {} } = {}) {
  const wait = Math.max(0, lastFetchAt + RATE_MS - Date.now())
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastFetchAt = Date.now()

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.FETCH_TIMEOUT) || 15000,
  )

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        ...(referer ? { Referer: referer } : {}),
        ...headers,
      },
    })
    const text = await res.text()
    // 反爬拦截：CCGP 频繁访问页 < 5KB 且含"频繁访问"
    if (text.includes('访问过于频繁') || text.includes('频繁访问')) {
      const err = new Error('rate limited by site')
      err.retryable = true
      throw err
    }
    return { status: res.status, html: text }
  } finally {
    clearTimeout(timeout)
  }
}

export function absoluteUrl(base, href) {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}
