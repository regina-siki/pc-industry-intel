// 公众号文章抓取器：给定 mp.weixin.qq.com 永久链接 → 抓正文 → 抽标题/作者/时间/摘要
// 微信文章 HTML 是 SSR，正文在 <div id="js_content"> 中；curl/fetch 即可拿到

import { fetchHtml } from '../http.js'

function decodeEntities(s = '') {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function stripTags(html = '') {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

// 从原始 HTML 中提取文章元信息 + 正文
export function parseWeChatArticle(html) {
  const isDead =
    /该(内容|公众号|文章)已被(发布者)?删除/.test(html) ||
    /此内容因违规无法查看/.test(html) ||
    /Not Found/i.test(html)

  const title =
    stripTags((html.match(/<h1[^>]+id="activity-name"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '') ||
    stripTags((html.match(/var msg_title\s*=\s*['"]([^'"]{5,300})['"]/) || [])[1] || '') ||
    stripTags((html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/) || [])[1] || '')

  const account =
    stripTags((html.match(/<a[^>]+id="js_name"[^>]*>([\s\S]*?)<\/a>/) || [])[1] || '') ||
    stripTags((html.match(/var nickname\s*=\s*['"]([^'"]{2,100})['"]/) || [])[1] || '') ||
    stripTags((html.match(/<meta[^>]+property="og:site_name"[^>]+content="([^"]+)"/) || [])[1] || '')

  const author =
    stripTags((html.match(/<span[^>]+id="js_author_name"[^>]*>([\s\S]*?)<\/span>/) || [])[1] || '') ||
    stripTags((html.match(/var author\s*=\s*['"]([^'"]{2,60})['"]/) || [])[1] || '')

  // 发布时间：优先 var ct（时间戳，秒），退化到 publish_time
  let publishedAt = ''
  const ct = html.match(/var ct\s*=\s*['"](\d{9,12})['"]/)
  if (ct) {
    const d = new Date(Number(ct[1]) * 1000)
    if (!isNaN(d.getTime())) publishedAt = d.toISOString().slice(0, 10)
  }
  if (!publishedAt) {
    const t = html.match(/var publish_time\s*=\s*['"]([^'"]+)['"]/)
    if (t) publishedAt = t[1].slice(0, 10)
  }

  // 正文
  const cMatch = html.match(/<div[^>]+id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<script/)
  const contentHtml = cMatch ? cMatch[1] : ''
  const contentText = stripTags(contentHtml)

  return {
    isDead,
    title,
    account,
    author,
    publishedAt,
    contentHtml,
    contentText,
  }
}

export async function fetchWeChatArticle(url) {
  if (!/^https:\/\/mp\.weixin\.qq\.com\/s\//.test(url)) {
    throw new Error('Only mp.weixin.qq.com/s/... URLs are supported')
  }
  const { html } = await fetchHtml(url, { referer: 'https://mp.weixin.qq.com/' })
  const parsed = parseWeChatArticle(html)
  if (parsed.isDead || !parsed.title) {
    throw new Error('Article deleted or content unavailable')
  }
  return { url, ...parsed }
}
