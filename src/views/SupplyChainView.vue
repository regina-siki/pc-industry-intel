<template>
  <div>
    <div class="panel notice" v-if="chain?.disclaimer">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ chain.disclaimer }}</span>
    </div>

    <div class="panel">
      <h2 class="section-title">服务器产业链图谱 · 市场份额</h2>
      <p class="muted small" style="margin: -8px 0 12px">
        每个环节展示 Top 玩家份额与近期变化。鼠标点击节点查看详情。
      </p>

      <div class="chain-columns" v-if="chain">
        <div class="chain-col" v-for="col in columns" :key="col.key">
          <div class="chain-col-title">{{ col.title }}</div>
          <div
            v-for="node in col.nodes"
            :key="node.id"
            class="chain-node"
            :class="{ active: activeId === node.id }"
            @click="activeId = node.id"
          >
            <div class="node-head">
              <span class="node-name">{{ node.name }}</span>
              <el-icon v-if="chain.marketShare?.[node.id]" class="node-caret">
                <ArrowRight />
              </el-icon>
            </div>
            <div v-if="chain.marketShare?.[node.id]" class="node-mini">
              <div
                v-for="p in chain.marketShare[node.id].players.slice(0, 3)"
                :key="p.name"
                class="mini-row"
              >
                <span class="mini-name">{{ p.name }}</span>
                <span class="mini-share" v-if="typeof p.share === 'number'">
                  {{ p.share }}%
                </span>
                <span class="mini-change" :class="`trend-${p.trend}`">
                  {{ trendArrow(p.trend) }} {{ p.change }}
                </span>
              </div>
              <div class="node-asof muted">
                📅 {{ chain.marketShare[node.id].asOf || '—' }}
              </div>
            </div>
            <div v-else class="muted small">
              {{ (chain.companies?.[node.id] || []).slice(0, 3).join(' · ') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中节点详情 -->
    <div class="panel" v-if="activeShare">
      <div class="detail-head">
        <div>
          <h3 style="margin: 0">
            {{ activeNode?.name }} · 市场结构
          </h3>
          <p class="muted small" style="margin: 4px 0 0">
            {{ activeShare.scope }}
          </p>
        </div>
        <div class="detail-meta">
          <el-tag size="small" type="warning" effect="light">
            📅 数据时间：{{ activeShare.asOf || '—' }}
          </el-tag>
          <div class="muted small" style="margin-top: 4px">
            来源：{{ activeShare.source }}
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <!-- 份额条形图 -->
        <div>
          <div class="block-title">Top 玩家份额</div>
          <div
            v-for="(p, i) in activeShare.players"
            :key="i"
            class="bar-row"
          >
            <div class="bar-label">
              <span>{{ p.name }}</span>
              <span class="bar-value">
                <template v-if="typeof p.share === 'number'">{{ p.share }}%</template>
                <template v-else>—</template>
                <span class="bar-change" :class="`trend-${p.trend}`">
                  {{ trendArrow(p.trend) }} {{ p.change }}
                </span>
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="`trend-${p.trend}`"
                :style="{ width: (typeof p.share === 'number' ? p.share : 0) + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- 变化解读 + 完整厂商列表 -->
        <div>
          <div class="block-title">近期变化</div>
          <p class="change-note">{{ activeShare.recentChange }}</p>

          <div class="block-title" style="margin-top: 16px">完整厂商列表</div>
          <div class="cust-tags">
            <el-tag
              v-for="c in (chain.companies?.[activeId] || [])"
              :key="c"
              size="small"
              style="margin-right: 4px; margin-bottom: 4px"
            >{{ c }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { InfoFilled, ArrowRight } from '@element-plus/icons-vue'
import { fetchSupplyChain } from '@/api'

const chain = ref(null)
const activeId = ref('')

const columns = computed(() => {
  const group = (layer) =>
    (chain.value?.nodes || []).filter((n) => n.layer === layer)
  return [
    { key: 'upstream', title: '上游 · 元器件 / 物料', nodes: group('upstream') },
    { key: 'mid', title: '中游 · 整机制造', nodes: group('mid') },
    { key: 'downstream', title: '下游 · 终端客户', nodes: group('downstream') },
  ]
})

const activeNode = computed(() =>
  (chain.value?.nodes || []).find((n) => n.id === activeId.value),
)
const activeShare = computed(() =>
  activeId.value ? chain.value?.marketShare?.[activeId.value] : null,
)

function trendArrow(t) {
  return { up: '↑', down: '↓', flat: '→' }[t] || '·'
}

onMounted(async () => {
  chain.value = await fetchSupplyChain()
  activeId.value = 'gpu'
})
</script>

<style scoped lang="scss">
.notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
  border: 1px dashed #fbbf24;
  color: #b45309;
  margin-bottom: 16px;
  font-size: 13px;
}

.small { font-size: 12px; }

.chain-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chain-col-title {
  font-weight: 600;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--c-primary);
}

.chain-node {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 10px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover,
  &.active {
    border-color: var(--c-primary);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  &.active {
    background: rgba(47, 84, 235, 0.03);
  }
}

.node-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
}

.node-name { font-weight: 600; }

.node-caret {
  color: var(--c-muted);
  font-size: 12px;
}

.node-mini {
  font-size: 12px;
  line-height: 1.7;
}

.node-asof {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--c-border);
  font-size: 11px;
}

.detail-meta {
  text-align: right;
}

.mini-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: baseline;
}

.mini-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-share {
  font-weight: 600;
  color: var(--c-text);
}

.mini-change {
  color: var(--c-muted);
  font-size: 11px;

  &.trend-up { color: #16a34a; }
  &.trend-down { color: #dc2626; }
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
}

.block-title {
  font-size: 13px;
  color: var(--c-muted);
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.bar-row {
  margin-bottom: 12px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
  font-size: 13px;
}

.bar-value {
  font-weight: 600;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.bar-change {
  font-size: 11px;
  font-weight: normal;

  &.trend-up { color: #16a34a; }
  &.trend-down { color: #dc2626; }
  &.trend-flat { color: var(--c-muted); }
}

.bar-track {
  height: 10px;
  background: var(--c-bg);
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--c-primary);
  transition: width 0.4s;

  &.trend-up { background: #16a34a; }
  &.trend-down { background: #dc2626; }
  &.trend-flat { background: #2f54eb; }
}

.change-note {
  margin: 0;
  padding: 10px 12px;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 6px;
  line-height: 1.7;
  font-size: 13px;
}

@media (max-width: 960px) {
  .chain-columns { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
