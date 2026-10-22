// 全局事件总线：跨页面通信（比如公众号入库后通知所有页面刷新）
import { reactive } from 'vue'
import { validSide } from '@/lib/category-map'

const state = reactive({
  ingestVersion: 0,        // 每次入库 +1，所有页面 watch 这个值即可实现自动刷新
  lastIngest: null,        // 最近一次入库的结果，用于全局横幅提示
  category: 'all',         // 当前品类：'all' | 'pc' | 'server'（全局过滤的响应式真相源）
})

export function bumpIngestVersion(payload = null) {
  state.ingestVersion += 1
  state.lastIngest = payload
}

// 设置品类（仅接受合法值）；变化时才赋值，避免无谓触发
export function setCategory(v) {
  const next = validSide(v)
  if (next !== state.category) state.category = next
}

export function useBus() {
  return state
}
