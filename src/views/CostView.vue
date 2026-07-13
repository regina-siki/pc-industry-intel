<template>
  <div class="cost">
    <!-- 说明 -->
    <div class="panel notice" v-if="bom?.disclaimer">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ bom.disclaimer }}</span>
      <details style="margin-left: auto">
        <summary class="muted small" style="cursor: pointer">数据源渠道</summary>
        <ul class="src-list">
          <li v-for="s in bom.dataSourceGuide" :key="s.name">
            <b>{{ s.name }}</b>
            <el-tag :type="typeOfSource(s.type)" size="small">{{ s.type }}</el-tag>
            <span class="muted small">· {{ s.note }}</span>
          </li>
        </ul>
      </details>
    </div>

    <!-- 关键零部件新闻 → BOM 影响 -->
    <div class="panel">
      <h2 class="section-title" style="margin: 0 0 4px">
        关键零部件动态 · 对 BOM 的影响
      </h2>
      <p class="muted small">
        近期供给/需求变化 → 单件价格变动 → 传导到整机 BOM 的增减幅度
      </p>
      <el-table :data="bom?.componentNewsImpact || []" stripe>
        <el-table-column label="部件" width="150">
          <template #default="{ row }">
            <b>{{ row.component }}</b>
            <div>
              <el-tag :type="levelType(row.level)" size="small">
                {{ levelLabel(row.level) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="近期动态" min-width="260">
          <template #default="{ row }">
            <div>{{ row.recentNews }}</div>
            <div v-if="row.newsDate" class="news-date muted small">
              📅 {{ row.newsDate }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格趋势" width="130">
          <template #default="{ row }">
            <div>{{ row.trend }}</div>
            <el-tag :type="deltaType(row.priceDelta)" size="small" style="margin-top: 4px">
              {{ row.priceDelta }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="影响时间" width="130">
          <template #default="{ row }">
            <div class="time-cell">
              <div>
                <el-icon><Clock /></el-icon>
                起：<b>{{ row.impactStartAt || '—' }}</b>
              </div>
              <div class="muted small">
                持续 {{ row.impactDurationQtrs || '—' }} 个季度
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="对 DGX B200 影响" min-width="180">
          <template #default="{ row }">
            <span class="muted small">{{ row.bomImpactDgx }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对工作站影响" min-width="180">
          <template #default="{ row }">
            <span class="muted small">{{ row.bomImpactWs }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="170">
          <template #default="{ row }">
            <span class="muted small">{{ row.source }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 整机 BOM 趋势预测 -->
    <div class="panel">
      <div class="head" style="margin: 0 0 8px">
        <div>
          <h2 class="section-title" style="margin: 0">
            整机 BOM 成本趋势预测
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            {{ bom?.forecast?.note }}
          </p>
        </div>
      </div>
      <v-chart
        v-if="forecastOption"
        :option="forecastOption"
        style="height: 380px"
        autoresize
      />
      <div class="legend-note muted small">
        <span class="dot up"></span>红点/上升 = 涨价压力事件；
        <span class="dot down"></span>绿点/下降 = 降本事件。
        鼠标悬停查看事件详情。
      </div>
    </div>

    <!-- 大模型演进 → 硬件影响 -->
    <div class="panel" v-if="bom?.llmEvolution">
      <div class="head" style="margin: 0 0 8px">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-llm">LLM</span>
            大模型演进 · 硬件影响推演
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            {{ bom.llmEvolution.note }}
          </p>
        </div>
      </div>

      <el-table :data="bom.llmEvolution.timeline" size="small" stripe>
        <el-table-column prop="date" label="时间" width="90" />
        <el-table-column label="主线 / 事件" min-width="280">
          <template #default="{ row }">
            <div style="font-weight: 600">{{ row.title }}</div>
            <el-tag size="small" style="margin-top: 4px">{{ row.line }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推演对硬件的影响" min-width="300">
          <template #default="{ row }">
            <span>{{ row.hardwareImpact }}</span>
          </template>
        </el-table-column>
        <el-table-column label="方向" width="90">
          <template #default="{ row }">
            <el-tag :type="impactSideType(row.impactSide)" size="small" effect="dark">
              {{ row.impactSide }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="受影响部件" width="180">
          <template #default="{ row }">
            <el-tag
              v-for="c in row.affectedComponents"
              :key="c"
              size="small"
              style="margin: 0 4px 4px 0"
            >{{ c }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="170">
          <template #default="{ row }">
            <span class="muted small">{{ row.source }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="predictions">
        <div class="pred-title">📡 未来推演</div>
        <div class="pred-grid">
          <div
            v-for="(p, i) in bom.llmEvolution.predictions"
            :key="i"
            class="pred-card"
            :class="`conf-${p.confidence}`"
          >
            <div class="pred-head">
              <span class="pred-horizon">{{ p.horizon }}</span>
              <el-tag :type="confType(p.confidence)" size="small">
                信心 · {{ confLabel(p.confidence) }}
              </el-tag>
            </div>
            <div class="pred-text">{{ p.prediction }}</div>
          </div>
        </div>
      </div>
    </div>


    <!-- 产品切换 + BOM 结构 -->
    <div class="panel head">
      <div>
        <h2 class="section-title" style="margin: 0">BOM 结构</h2>
        <p class="muted small" v-if="product">
          {{ product.name }} · 数据来源：{{ (product.sourceRefs || []).join(' / ') }}
        </p>
      </div>
      <el-radio-group v-model="currentId" size="default">
        <el-radio-button
          v-for="p in (bom?.products || [])"
          :key="p.id"
          :label="p.id"
        >{{ p.name }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="grid" v-if="product">
      <!-- 左：产品示意图 + KPI -->
      <div class="panel">
        <div class="stat-row">
          <div class="stat">
            <div class="muted small">整机 BOM 估算</div>
            <div class="stat-value">${{ formatNum(product.totalCost) }}</div>
          </div>
          <div class="stat">
            <div class="muted small">整机售价 (ASP)</div>
            <div class="stat-value">${{ formatNum(product.asp) }}</div>
          </div>
          <div class="stat">
            <div class="muted small">毛利率</div>
            <div class="stat-value" style="color: #16a34a">
              {{ ((1 - product.totalCost / product.asp) * 100).toFixed(1) }}%
            </div>
          </div>
        </div>

        <!-- 产品结构示意图（悬停部件与饼图联动） -->
        <ProductDiagram
          :product-id="product.id"
          :components="product.components"
          :active-part="hoverPart"
          @hover="hoverPart = $event"
        />
      </div>

      <!-- 右：饼图 -->
      <div class="panel">
        <h3 style="margin-top: 0">BOM 占比</h3>
        <v-chart
          :option="pieOption"
          style="height: 420px"
          autoresize
          @mouseover="onPieHover"
          @mouseout="hoverPart = ''"
        />
      </div>
    </div>

    <!-- 明细表 —— 每部件带最近 6 个月价格走势 -->
    <div class="panel" v-if="product">
      <h3 style="margin-top: 0">部件明细 · 近期价格走势</h3>
      <p class="muted small" style="margin-top: -4px">
        每条 sparkline 展示最近 6 个月归一化价格指数（基准 100）· 数据来源见「关键零部件动态」和各行业机构
      </p>
      <el-table :data="product.components" stripe size="small">
        <el-table-column prop="part" label="部件" min-width="200" />
        <el-table-column label="占比" width="80" align="right">
          <template #default="{ row }">
            {{ (row.share * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column label="估算成本" width="120" align="right">
          <template #default="{ row }">
            ${{ formatNum(row.cost) }}
          </template>
        </el-table-column>
        <el-table-column label="近 6 个月价格" min-width="220">
          <template #default="{ row }">
            <Sparkline
              v-if="row.priceHistory"
              :values="row.priceHistory.values"
              :labels="row.priceHistory.labels"
              :trend="row.priceHistory.trend"
            />
            <span v-else class="muted small">—</span>
          </template>
        </el-table-column>
        <el-table-column label="主要供应商" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="v in row.vendors"
              :key="v"
              size="small"
              style="margin-right: 4px"
            >{{ v }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="140" />
        <el-table-column label="数据来源" min-width="160">
          <template #default="{ row }">
            <span class="muted small">{{ row.source || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TooltipComponent, LegendComponent, TitleComponent,
  GridComponent, MarkPointComponent, MarkLineComponent, MarkAreaComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { InfoFilled, Clock } from '@element-plus/icons-vue'
import ProductDiagram from '@/components/ProductDiagram.vue'
import Sparkline from '@/components/Sparkline.vue'
import { fetchBom } from '@/api'

use([
  CanvasRenderer, PieChart, LineChart,
  TooltipComponent, LegendComponent, TitleComponent,
  GridComponent, MarkPointComponent, MarkLineComponent, MarkAreaComponent,
])

const bom = ref(null)
const currentId = ref('')
const hoverPart = ref('')

function onPieHover(e) {
  if (e?.name) hoverPart.value = e.name
}

const product = computed(() =>
  bom.value?.products?.find((p) => p.id === currentId.value),
)

const pieOption = computed(() => {
  const displayComps = (product.value?.components || []).filter(
    (c) => !/内含于/.test(c.note || ''),
  )
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) =>
        `${p.name}<br/>占比 ${(p.percent).toFixed(1)}% · $${formatNum(p.value)}`,
    },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        name: 'BOM',
        type: 'pie',
        radius: ['40%', '68%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { formatter: '{b}\n{d}%', fontSize: 11 },
        data: displayComps.map((c) => ({
          name: c.part,
          value: c.cost,
        })),
      },
    ],
  }
})

// —— 整机 BOM 趋势预测 ——
// 逻辑：quarters 是季度序列（如 2026-Q2 ... 2027-Q4），基准指数 100。
// 每个 componentNewsImpact 事件按 impactStartAt 起、跨 impactDurationQtrs 个季度，
// 把 bomImpactDgxPct / bomImpactWsPct 线性摊入对应产品的指数。
function computeForecast() {
  const fc = bom.value?.forecast
  const events = bom.value?.componentNewsImpact || []
  if (!fc) return null

  const qtrs = fc.quarters || []
  const idxOf = (q) => qtrs.indexOf(q)

  // 每个产品每季度的累计增量
  const dgxDelta = new Array(qtrs.length).fill(0)
  const wsDelta = new Array(qtrs.length).fill(0)

  for (const ev of events) {
    const startIdx = idxOf(ev.impactStartAt)
    if (startIdx < 0) continue
    const dur = Math.max(1, ev.impactDurationQtrs || 1)
    const perQuarterDgx = (ev.bomImpactDgxPct || 0) / dur
    const perQuarterWs = (ev.bomImpactWsPct || 0) / dur
    for (let i = 0; i < dur && startIdx + i < qtrs.length; i++) {
      dgxDelta[startIdx + i] += perQuarterDgx
      wsDelta[startIdx + i] += perQuarterWs
    }
  }

  // 累加到指数
  const basis = fc.basisIndex || 100
  const dgxIdx = []
  const wsIdx = []
  let cumDgx = 0
  let cumWs = 0
  for (let i = 0; i < qtrs.length; i++) {
    cumDgx += dgxDelta[i]
    cumWs += wsDelta[i]
    dgxIdx.push(+(basis + cumDgx).toFixed(2))
    wsIdx.push(+(basis + cumWs).toFixed(2))
  }

  // 事件标记点（放在 impactStartAt 那一季度的对应曲线上）
  const dgxMarks = []
  const wsMarks = []
  for (const ev of events) {
    const startIdx = idxOf(ev.impactStartAt)
    if (startIdx < 0) continue
    if (ev.bomImpactDgxPct && Math.abs(ev.bomImpactDgxPct) >= 0.5) {
      dgxMarks.push({
        name: ev.component,
        xAxis: startIdx,
        yAxis: dgxIdx[startIdx],
        symbolSize: Math.min(50, 15 + Math.abs(ev.bomImpactDgxPct) * 3),
        itemStyle: { color: ev.bomImpactDgxPct > 0 ? '#dc2626' : '#16a34a' },
        _ev: ev,
        _which: 'dgx',
      })
    }
    if (ev.bomImpactWsPct && Math.abs(ev.bomImpactWsPct) >= 0.5) {
      wsMarks.push({
        name: ev.component,
        xAxis: startIdx,
        yAxis: wsIdx[startIdx],
        symbolSize: Math.min(50, 15 + Math.abs(ev.bomImpactWsPct) * 5),
        itemStyle: { color: ev.bomImpactWsPct > 0 ? '#dc2626' : '#16a34a' },
        _ev: ev,
        _which: 'ws',
      })
    }
  }

  return { qtrs, dgxIdx, wsIdx, dgxMarks, wsMarks, basis }
}

const forecastOption = computed(() => {
  const f = computeForecast()
  if (!f) return null

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const qtr = params[0]?.axisValue
        const lines = params.map(
          (p) => `${p.marker}${p.seriesName}: <b>${p.value}</b>`,
        )
        return `${qtr}<br/>${lines.join('<br/>')}`
      },
    },
    legend: { bottom: 0 },
    grid: { top: 40, left: 60, right: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: f.qtrs,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '指数(基准=100)',
      nameTextStyle: { fontSize: 11 },
      scale: true,
      axisLine: { show: true },
    },
    series: [
      {
        name: 'DGX B200 BOM 指数',
        type: 'line',
        smooth: true,
        data: f.dgxIdx,
        lineStyle: { width: 2.5 },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { type: 'dashed', color: '#999' },
          data: [{ yAxis: f.basis, label: { formatter: '基准 100' } }],
        },
        markPoint: {
          symbol: 'circle',
          label: {
            formatter: (p) =>
              p.data._ev.bomImpactDgxPct > 0
                ? `+${p.data._ev.bomImpactDgxPct}%`
                : `${p.data._ev.bomImpactDgxPct}%`,
            fontSize: 10,
            color: '#fff',
          },
          tooltip: {
            formatter: (p) => {
              const ev = p.data._ev
              return `<b>${ev.component}</b><br/>` +
                `${ev.recentNews}<br/>` +
                `影响：${ev.bomImpactDgxPct > 0 ? '+' : ''}${ev.bomImpactDgxPct}% ` +
                `（${ev.impactStartAt} 起，持续 ${ev.impactDurationQtrs} 季度）`
            },
          },
          data: f.dgxMarks,
        },
      },
      {
        name: '395 工作站 BOM 指数',
        type: 'line',
        smooth: true,
        data: f.wsIdx,
        lineStyle: { width: 2.5 },
        markPoint: {
          symbol: 'circle',
          label: {
            formatter: (p) =>
              p.data._ev.bomImpactWsPct > 0
                ? `+${p.data._ev.bomImpactWsPct}%`
                : `${p.data._ev.bomImpactWsPct}%`,
            fontSize: 10,
            color: '#fff',
          },
          tooltip: {
            formatter: (p) => {
              const ev = p.data._ev
              return `<b>${ev.component}</b><br/>` +
                `${ev.recentNews}<br/>` +
                `影响：${ev.bomImpactWsPct > 0 ? '+' : ''}${ev.bomImpactWsPct}% ` +
                `（${ev.impactStartAt} 起，持续 ${ev.impactDurationQtrs} 季度）`
            },
          },
          data: f.wsMarks,
        },
      },
    ],
  }
})

function formatNum(n) { return Math.round(n).toLocaleString('en-US') }
function deltaClass(v, invert = false) {
  const positive = invert ? v < 0 : v > 0
  const negative = invert ? v > 0 : v < 0
  return { 'delta-up': positive, 'delta-down': negative }
}
function levelType(l) { return { high: 'danger', mid: 'warning', low: 'info' }[l] || 'info' }
function levelLabel(l) { return { high: '高影响', mid: '中影响', low: '低影响' }[l] || l }
function impactSideType(s) {
  if (s === '上行') return 'danger'
  if (s === '下行') return 'success'
  return 'warning'
}
function confType(c) { return { high: 'danger', mid: 'warning', low: 'info' }[c] || 'info' }
function confLabel(c) { return { high: '高', mid: '中', low: '低' }[c] || c }
function deltaType(str) {
  if (!str) return 'info'
  if (str.includes('+')) return 'danger'
  if (str.includes('-')) return 'success'
  return 'warning'
}
function typeOfSource(t) {
  if (t === '免费') return 'success'
  if (t === '半免费') return 'warning'
  return 'info'
}

onMounted(async () => {
  bom.value = await fetchBom()
  currentId.value = bom.value?.products?.[0]?.id || ''
})
</script>

<style scoped lang="scss">
.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
  border: 1px dashed #fbbf24;
  color: #b45309;
  margin-bottom: 16px;
  font-size: 13px;
}

.src-list {
  margin: 8px 0 0;
  padding-left: 16px;
  line-height: 2;
  font-size: 13px;

  .el-tag { margin: 0 6px; vertical-align: 2px; }
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.small { font-size: 12px; }

.grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  gap: 20px;
  padding: 12px 16px;
  background: rgba(47, 84, 235, 0.04);
  border-radius: 6px;
  margin-bottom: 12px;
}

.stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }

.slider { margin-bottom: 22px; }

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.summary {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(19, 194, 194, 0.06);
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.delta-up { color: #dc2626; }
.delta-down { color: #16a34a; }

.news-date {
  margin-top: 4px;
  padding: 2px 8px;
  display: inline-block;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 4px;
  color: var(--c-primary);
}

.badge-llm {
  display: inline-block;
  background: #7c3aed;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  vertical-align: 3px;
}

.predictions {
  margin-top: 16px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  border: 1px dashed #c4b5fd;
  border-radius: var(--radius);
}

.pred-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.pred-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.pred-card {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 6px;

  &.conf-high { border-left: 3px solid #dc2626; }
  &.conf-mid { border-left: 3px solid #f59e0b; }
  &.conf-low { border-left: 3px solid #64748b; }
}

.pred-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.pred-horizon {
  font-weight: 600;
  font-size: 13px;
}

.pred-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-text);
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;

  .el-icon {
    vertical-align: -2px;
    margin-right: 2px;
    color: var(--c-muted);
  }
}

.legend-note {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.legend-note .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 4px 0 8px;

  &.up { background: #dc2626; }
  &.down { background: #16a34a; }
}

@media (max-width: 960px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
