// 全局事件总线：跨页面通信（比如公众号入库后通知所有已挂载的页面刷新）
import { reactive } from 'vue'

const state = reactive({
  ingestVersion: 0,   // 每次入库 +1，所有页面 watch 这个值即可实现自动刷新
  lastIngest: null,   // 最近一次入库的结果，用于全局横幅提示
})

export function bumpIngestVersion(payload = null) {
  state.ingestVersion += 1
  state.lastIngest = payload
}

export function useBus() {
  return state
}
