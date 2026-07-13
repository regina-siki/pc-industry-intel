import { fetchAllRss } from '../fetchers/rss.js'
import { fetchAllTenders } from '../fetchers/tenders.js'

async function main() {
  console.log('[fetch] rss start')
  const rss = await fetchAllRss()
  console.log('[fetch] rss done', rss)

  console.log('[fetch] tenders start')
  const tenders = await fetchAllTenders()
  console.log('[fetch] tenders done', tenders)
}

main().catch((e) => {
  console.error('[fetch] failed', e)
  process.exit(1)
})
