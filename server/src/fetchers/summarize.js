// 规则式摘要：抽第一段 + 每个 <h2>/<h3>/<strong> 下的首句，控制在 300 字内
// 后续接入 LLM 时，把这个函数换掉即可

export function ruleSummarize(contentHtml, contentText) {
  if (!contentText) return ''

  // 1) 首段（<p> 或前 200 字）
  const firstP = (contentHtml.match(/<p[^>]*>([\s\S]{20,300}?)<\/p>/) || [])[1]
  const first = firstP
    ? firstP.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
    : contentText.slice(0, 200)

  // 2) 抽 3 个小标题（<h1..h4> 或加粗）
  const heads = []
  const headRe = /<(?:h[1-4]|strong)[^>]*>([\s\S]{4,60}?)<\/(?:h[1-4]|strong)>/g
  let m
  while ((m = headRe.exec(contentHtml)) !== null && heads.length < 3) {
    const t = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (t && !heads.includes(t) && t.length >= 4) heads.push(t)
  }

  let summary = first
  if (heads.length) summary += `【要点】${heads.join(' / ')}`
  return summary.slice(0, 300)
}
