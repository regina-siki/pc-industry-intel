<template>
  <div>
    <div class="panel notice" v-if="chain?.disclaimer">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ chain.disclaimer }}</span>
      <span class="muted small" style="margin-left: auto">
        · 上下游供应链页 · 用于库存备货 / 前台调价 / 供应商谈判
      </span>
    </div>

    <!-- ═══════ 顶部：近 N 天资讯 · 三层动态摘要 ═══════ -->
    <div class="panel summary-panel" v-if="chainImpact">
      <div class="section-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-live">动态</span>
            近 {{ chainImpact.windowDays }} 天资讯 · 对产业链的影响
          </h2>
          <span class="muted small">
            自动聚合入库资讯 · 更新于 {{ chainImpact.generatedAt }} · 共 {{ chainImpact.totalArticles }} 条
          </span>
        </div>
        <div>
          <el-radio-group v-model="chainImpactDays" size="small">
            <el-radio-button :label="3">近 3 天</el-radio-button>
            <el-radio-button :label="7">近 7 天</el-radio-button>
            <el-radio-button :label="14">近 14 天</el-radio-button>
            <el-radio-button :label="30">近 30 天</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="summary-grid">
        <div
          class="summary-col"
          v-for="s in chainImpact.summaryBullets"
          :key="s.layerId"
        >
          <div class="col-title">
            <span class="col-icon">{{ layerIcon(s.layerName) }}</span>
            {{ s.layerName }}
            <el-tag
              :type="trendType(s.trend)"
              size="small"
              effect="dark"
              style="margin-left: 6px"
            >
              {{ trendIcon(s.trend) }} {{ s.count }} 条
            </el-tag>
          </div>
          <ul v-if="s.bullets?.length">
            <li v-for="b in s.bullets" :key="b.id">
              <router-link :to="`/news/${b.id}`" class="bullet-link">
                <span class="bullet-tag">[{{ b.subName }}]</span>
                {{ b.title }}
              </router-link>
              <span class="muted small bullet-meta">· {{ b.source }} · {{ b.publishedAt }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ═══════ 三大 section · 每层子分类卡片 ═══════ -->
    <div
      v-for="layer in layers"
      :key="layer.id"
      class="panel layer-section"
      :class="`layer-${layer.id}`"
    >
      <div class="layer-head">
        <h2 class="section-title" style="margin: 0">
          {{ layer.icon }} {{ layer.name }}
          <span class="muted small" style="margin-left: 8px">
            · {{ layer.nodes.length }} 个环节
          </span>
        </h2>
        <p class="muted small" style="margin: 4px 0 0">{{ layer.desc }}</p>
      </div>

      <div class="node-grid">
        <div
          v-for="node in layer.nodes"
          :key="node.id"
          class="node-card"
        >
          <!-- 头部：节点名 + 数据时间 -->
          <div class="node-head">
            <div class="node-name">{{ node.name }}</div>
            <div class="muted small" v-if="chain?.marketShare?.[node.id]?.asOf">
              数据期 · {{ chain.marketShare[node.id].asOf }}
            </div>
          </div>

          <!-- Top 玩家 + share bar -->
          <div class="mini-shares" v-if="chain?.marketShare?.[node.id]?.players">
            <div
              v-for="p in chain.marketShare[node.id].players.slice(0, 4)"
              :key="p.name"
              class="mini-row"
            >
              <div class="mini-name-line">
                <span class="mini-name">{{ p.name }}</span>
                <span class="mini-metric">
                  <template v-if="typeof p.share === 'number'">{{ p.share }}%</template>
                  <template v-else>—</template>
                  <span class="mini-change" :class="`trend-${p.trend}`">
                    {{ trendArrow(p.trend) }} {{ p.change }}
                  </span>
                </span>
              </div>
              <div class="mini-bar-track">
                <div
                  class="mini-bar-fill"
                  :class="`trend-${p.trend}`"
                  :style="{ width: (typeof p.share === 'number' ? p.share : 0) + '%' }"
                />
              </div>
            </div>
          </div>

          <!-- 相关新闻（从 chainImpact.layers 里查同 sub） -->
          <div class="node-news" v-if="nodeNews(node.id)?.length">
            <div class="mini-title">相关新闻</div>
            <router-link
              v-for="a in nodeNews(node.id).slice(0, 3)"
              :key="a.id"
              :to="`/news/${a.id}`"
              class="news-row"
            >
              <span class="muted small news-date">{{ a.publishedAt }}</span>
              <span class="news-title">{{ a.title }}</span>
              <span class="muted small news-source">{{ a.source }}</span>
            </router-link>
          </div>

          <!-- 价格 sparkline（如有匹配的 BOM 组件） -->
          <div class="node-price" v-if="nodePrice(node.id)">
            <div class="mini-title">参考价格走势 · 6 个月归一化</div>
            <div class="price-row">
              <span class="muted small price-part">{{ nodePrice(node.id).part }}</span>
              <Sparkline
                :values="nodePrice(node.id).values"
                :labels="nodePrice(node.id).labels"
                :trend="nodePrice(node.id).trend"
              />
            </div>
          </div>

          <!-- 建议动作（从 componentNewsImpact 抽） -->
          <div class="node-action" v-if="nodeAction(node.id)">
            <div class="mini-title">京东建议动作</div>
            <div class="action-content">{{ nodeAction(node.id) }}</div>
          </div>

          <!-- recentChange -->
          <div class="node-change muted small" v-if="chain?.marketShare?.[node.id]?.recentChange">
            近期变化 · {{ chain.marketShare[node.id].recentChange }}
          </div>

          <div class="src-tag" v-if="chain?.marketShare?.[node.id]?.source">
            来源：{{ chain.marketShare[node.id].source }}
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ BOM 详情（可切产品）═══════ -->
    <div class="panel" v-if="bom?.products">
      <div class="head">
        <div>
          <h2 class="section-title" style="margin: 0">
            关键产品 BOM 明细 · 部件价格走势
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            每条 sparkline 展示部件近 6 个月归一化价格指数 · 用于库存备货和成本对齐
          </p>
        </div>
        <el-select v-model="currentBomId" size="default" style="width: 260px">
          <el-option
            v-for="p in bom.products"
            :key="p.id"
            :label="p.name"
            :value="p.id"
          />
        </el-select>
      </div>

      <el-table :data="currentBom?.components || []" stripe size="small">
        <el-table-column prop="part" label="部件" min-width="200" />
        <el-table-column label="占比" width="80" align="right">
          <template #default="{ row }">{{ (row.share * 100).toFixed(0) }}%</template>
        </el-table-column>
        <el-table-column label="估算成本" width="130" align="right">
          <template #default="{ row }">
            {{ currentBom?.currency === 'CNY' ? '¥' : '$' }}{{ formatNum(row.cost) }}
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
        <el-table-column label="供应商" min-width="180">
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
        <el-table-column label="来源" min-width="150">
          <template #default="{ row }">
            <span class="muted small">{{ row.source || '—' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ═══════ 关键零部件动态 · componentNewsImpact ═══════ -->
    <div class="panel" v-if="bom?.componentNewsImpact">
      <h2 class="section-title" style="margin: 0 0 4px">
        关键零部件动态 · 对 BOM 的影响
      </h2>
      <p class="muted small">
        近期供给/需求变化 → 单件价格变动 → 传导到整机 BOM 的增减幅度
      </p>
      <el-table :data="bom.componentNewsImpact" stripe size="small">
        <el-table-column label="部件" width="150">
          <template #default="{ row }">
            <b>{{ row.component }}</b>
            <div><el-tag :type="levelType(row.level)" size="small">{{ levelLabel(row.level) }}</el-tag></div>
          </template>
        </el-table-column>
        <el-table-column label="近期动态" min-width="260">
          <template #default="{ row }">
            <div>{{ row.recentNews }}</div>
            <div v-if="row.newsDate" class="muted small">日期 · {{ row.newsDate }}</div>
          </template>
        </el-table-column>
        <el-table-column label="价格趋势" width="130">
          <template #default="{ row }">
            <div>{{ row.trend }}</div>
            <el-tag :type="deltaType(row.priceDelta)" size="small">{{ row.priceDelta }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="影响时间" width="130">
          <template #default="{ row }">
            <div>起：<b>{{ row.impactStartAt || '—' }}</b></div>
            <div class="muted small">持续 {{ row.impactDurationQtrs || '—' }} 季</div>
          </template>
        </el-table-column>
        <el-table-column label="对 DGX 影响" min-width="160">
          <template #default="{ row }">
            <span class="muted small">{{ row.bomImpactDgx }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对 PC/工作站影响" min-width="200">
          <template #default="{ row }">
            <span class="muted small">{{ row.bomImpactWs }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="160">
          <template #default="{ row }">
            <span class="muted small">{{ row.source }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ═══════ 底部：宏观政策 6 tab ═══════ -->
    <div class="panel policy" v-if="macroPolicy">
      <div class="policy-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-policy">政策</span>
            宏观政策动向
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            国家 + 地方 + 采购信号 + 创业激励 + 大厂生态 + 美国出口管制 · 更新于 {{ macroPolicy.updatedAt }}
          </p>
        </div>
      </div>

      <div class="policy-headline">
        核心判断 · {{ macroPolicy.summary.headline }}
        <ul class="policy-directions">
          <li v-for="(k, i) in macroPolicy.summary.keyDirections" :key="i">{{ k }}</li>
        </ul>
      </div>

      <el-tabs v-model="policyTab" class="policy-tabs">
        <el-tab-pane
          :label="`国家级政策 (${macroPolicy.national?.length || 0})`"
          name="national"
        >
          <el-table :data="macroPolicy.national" size="small" stripe>
            <el-table-column prop="title" label="政策 / 工程" min-width="220">
              <template #default="{ row }">
                <b>{{ row.title }}</b>
                <div class="muted small">{{ row.issuer }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="时间" width="150" />
            <el-table-column prop="amount" label="金额 / 规模" width="180" />
            <el-table-column prop="focus" label="重点方向" min-width="200" />
            <el-table-column prop="impact" label="对 PC / AI 硬件 / 服务器 的影响" min-width="220" />
            <el-table-column label="来源" width="200">
              <template #default="{ row }">
                <span class="muted small">{{ row.source }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane
          :label="`地方补贴 & 算力券 (${macroPolicy.local?.length || 0})`"
          name="local"
        >
          <div class="local-grid">
            <div v-for="(l, i) in macroPolicy.local" :key="i" class="local-card">
              <div class="local-city">地区 · {{ l.city }}</div>
              <div class="local-title">{{ l.title }}</div>
              <div class="local-amount">{{ l.amount }}</div>
              <div class="muted small">时间 · {{ l.date }}</div>
              <div class="muted small"><b>方向：</b>{{ l.focus }}</div>
              <div class="muted small"><b>影响：</b>{{ l.impact }}</div>
              <div class="src-tag">来源：{{ l.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`采购信号 (${macroPolicy.procurementSignals?.length || 0})`"
          name="signals"
        >
          <div class="signal-grid">
            <div v-for="(s, i) in macroPolicy.procurementSignals" :key="i" class="signal-card">
              <div class="signal-title">
                <span class="signal-dot"></span>{{ s.signal }}
              </div>
              <div class="muted small">{{ s.detail }}</div>
              <div class="signal-impact">影响 · <b>{{ s.impact }}</b></div>
              <div class="src-tag">来源：{{ s.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`AI 创业者激励 (${macroPolicy.startupIncentives?.length || 0})`"
          name="startup"
        >
          <div class="local-grid startup-grid">
            <div v-for="(l, i) in macroPolicy.startupIncentives" :key="i" class="local-card startup-card">
              <div class="local-city">地区 · {{ l.region }}</div>
              <div class="local-title">{{ l.program }}</div>
              <div class="muted small" v-if="l.docNo"><b>文号：</b>{{ l.docNo }}</div>
              <div class="muted small" v-if="l.documentDate">日期 · {{ l.documentDate }}</div>
              <div v-if="l.targetAudience" class="startup-block">
                <b>面向：</b>{{ l.targetAudience.who }}
              </div>
              <div v-if="l.funding?.cash?.length" class="startup-block">
                <b>现金与补贴：</b>
                <ul>
                  <li v-for="c in l.funding.cash" :key="c">{{ c }}</li>
                </ul>
              </div>
              <div v-if="l.resources?.length" class="startup-block">
                <b>资源：</b>
                <ul>
                  <li v-for="r in l.resources" :key="r">{{ r }}</li>
                </ul>
              </div>
              <div class="src-tag">来源：{{ l.source }}</div>
              <a v-if="l.sourceUrl" :href="l.sourceUrl" target="_blank" rel="noopener" class="src-link">
                查看来源 ↗
              </a>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`大厂 AI 生态 (${macroPolicy.corpAIPrograms?.length || 0})`"
          name="corp"
        >
          <div class="local-grid">
            <div v-for="(c, i) in macroPolicy.corpAIPrograms" :key="i" class="local-card corp-card">
              <div class="local-city corp-name">{{ c.company }}</div>
              <div class="local-title">{{ c.program }}</div>
              <ul class="startup-hl">
                <li v-for="h in c.highlights" :key="h">{{ h }}</li>
              </ul>
              <div class="muted small"><b>面向：</b>{{ c.targetPartners }}</div>
              <div class="local-amount">{{ c.budget }}</div>
              <div class="src-tag">来源：{{ c.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`监管影响 · 利好/利空 (${(macroPolicy.regulatoryImpacts?.positives?.length || 0) + (macroPolicy.regulatoryImpacts?.negatives?.length || 0)})`"
          name="regulatory"
        >
          <div v-if="macroPolicy.regulatoryImpacts" class="reg-block">
            <div class="reg-note muted small">
              研究提示 · {{ macroPolicy.regulatoryImpacts.note }}
            </div>
            <div v-if="macroPolicy.regulatoryImpacts.netAssessment" class="reg-net">
              <div class="reg-net-title">
                综合判断 · {{ macroPolicy.regulatoryImpacts.netAssessment.headline }}
              </div>
              <ul class="reg-net-logic">
                <li v-for="l in macroPolicy.regulatoryImpacts.netAssessment.logic" :key="l">{{ l }}</li>
              </ul>
              <div class="reg-net-action">
                <div class="reg-net-action-title">京东建议动作</div>
                <ul>
                  <li v-for="a in macroPolicy.regulatoryImpacts.netAssessment.actionForJd" :key="a">{{ a }}</li>
                </ul>
              </div>
            </div>
            <div class="reg-two-col">
              <div class="reg-col positive">
                <div class="reg-col-head">
                  <span class="reg-col-title" style="color: #15803d">📈 利好政策</span>
                  <span class="muted small">{{ macroPolicy.regulatoryImpacts.positives?.length }} 条</span>
                </div>
                <div v-for="(p, i) in macroPolicy.regulatoryImpacts.positives" :key="i" class="reg-card reg-positive">
                  <div class="reg-card-title">{{ p.title }}</div>
                  <div class="muted small">{{ p.issuer }} · {{ p.date }}</div>
                  <div class="reg-section" v-if="p.action?.length">
                    <b>📜 政策动作</b>
                    <ul><li v-for="a in p.action" :key="a">{{ a }}</li></ul>
                  </div>
                  <div class="reg-section" v-if="p.productImpact?.length">
                    <b>🛠 对产品的影响</b>
                    <ul><li v-for="pi in p.productImpact" :key="pi">{{ pi }}</li></ul>
                  </div>
                  <div class="src-tag">来源：{{ p.source }}</div>
                </div>
              </div>
              <div class="reg-col negative">
                <div class="reg-col-head">
                  <span class="reg-col-title" style="color: #991b1b">📉 利空政策</span>
                  <span class="muted small">{{ macroPolicy.regulatoryImpacts.negatives?.length }} 条</span>
                </div>
                <div v-for="(n, i) in macroPolicy.regulatoryImpacts.negatives" :key="i" class="reg-card reg-negative">
                  <div class="reg-card-title">{{ n.title }}</div>
                  <div class="muted small">{{ n.issuer }} · {{ n.date }}</div>
                  <div class="reg-section" v-if="n.action?.length">
                    <b>📜 政策动作</b>
                    <ul><li v-for="a in n.action" :key="a">{{ a }}</li></ul>
                  </div>
                  <div class="reg-section" v-if="n.productImpact?.length">
                    <b>🛠 对产品的影响</b>
                    <ul><li v-for="pi in n.productImpact" :key="pi">{{ pi }}</li></ul>
                  </div>
                  <div class="src-tag">来源：{{ n.source }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`美国出口管制 (${macroPolicy.usRestrictions?.length || 0})`"
          name="us"
        >
          <div class="us-impact" v-if="macroPolicy.usRestrictionImpact">
            <div class="us-headline">{{ macroPolicy.usRestrictionImpact.headline }}</div>
            <div class="us-impact-grid">
              <div class="us-impact-cell">
                <b>⚡ 短期影响</b>
                <ul><li v-for="s in macroPolicy.usRestrictionImpact.shortTerm" :key="s">{{ s }}</li></ul>
              </div>
              <div class="us-impact-cell">
                <b>🔭 中长期影响</b>
                <ul><li v-for="l in macroPolicy.usRestrictionImpact.longTerm" :key="l">{{ l }}</li></ul>
              </div>
              <div class="us-impact-cell">
                <b>国产受益方</b>
                <ul><li v-for="b in macroPolicy.usRestrictionImpact.beneficiaries" :key="b">{{ b }}</li></ul>
              </div>
              <div class="us-impact-cell">
                <b>潜在风险</b>
                <ul><li v-for="r in macroPolicy.usRestrictionImpact.risks" :key="r">{{ r }}</li></ul>
              </div>
            </div>
          </div>
          <div class="us-timeline">
            <div class="us-timeline-title">📜 关键出口管制事件时间轴</div>
            <div v-for="(u, i) in macroPolicy.usRestrictions" :key="i" class="us-event">
              <div class="us-event-marker">
                <div class="us-phase-badge">{{ u.phase }}</div>
                <div class="us-date">{{ u.date }}</div>
              </div>
              <div class="us-event-body">
                <div class="us-event-title">{{ u.title }}</div>
                <div class="muted small"><b>发布方：</b>{{ u.issuer }}</div>
                <div class="us-scope">
                  <b>管制范围：</b>
                  <template v-if="Array.isArray(u.scope)">
                    <ul><li v-for="(s, si) in u.scope" :key="si">{{ s }}</li></ul>
                  </template>
                  <span v-else>{{ u.scope }}</span>
                </div>
                <div class="us-impact-line"><b>影响：</b>{{ u.impact }}</div>
                <div class="us-response">🇨🇳 <b>中方响应：</b>{{ u.chinaResponse }}</div>
                <div class="src-tag">来源：{{ u.source }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { fetchSupplyChain, fetchNewsChainImpact, fetchBom, fetchMacroPolicy } from '@/api'
import Sparkline from '@/components/Sparkline.vue'
import { useBus } from '@/stores/bus'

const bus = useBus()
const chain = ref(null)
const chainImpact = ref(null)
const chainImpactDays = ref(7)
const bom = ref(null)
const macroPolicy = ref(null)
const currentBomId = ref('gaming-desktop-2026')
const policyTab = ref('national')

const layers = computed(() => {
  const nodes = chain.value?.nodes || []
  return [
    { id: 'upstream', name: '上游 · 元器件', icon: 'UP', desc: 'CPU / GPU / 内存 / 存储 / PCB / 主板 / 显卡 / 内存条 / 散热 / 显示器 / 外设 · 关注单件价格变化，用于库存备货和成本对齐', nodes: nodes.filter(n => n.layer === 'upstream') },
    { id: 'mid', name: '中游 · 整机制造', icon: 'MID', desc: '服务器 OEM / ODM / PC 品牌 / 笔电 ODM / AIO+Mini · 关注头部集中度和产能爬坡节奏', nodes: nodes.filter(n => n.layer === 'mid') },
    { id: 'downstream', name: '下游 · 终端客户', icon: 'DOWN', desc: '云厂商 / 运营商 / 政企 / PC 零售 / DIY / 企业 IT / 教育 / 游戏 · 关注采购节奏和需求信号', nodes: nodes.filter(n => n.layer === 'downstream') },
  ]
})

// 节点 → 相关新闻查询：把 static.json 的 nodeId 映射到 chain-impact 的 subCategory key
const NODE_TO_SUB = {
  cpu: 'cpu', gpu: 'gpu', mem: 'memory', storage: 'storage', pcb: 'pcb', power: 'power',
  'pc-cpu': 'pc-cpu', 'pc-gpu-aic': 'pc-gpu', mb: 'motherboard',
  'ram-diy': 'ram-diy', 'ssd-consumer': 'ssd-consumer',
  'case-cooler': 'case-cooler', monitor: 'monitor', peripheral: 'peripheral',
  oem: 'oem', odm: 'odm', 'pc-oem': 'pc-oem', 'nb-odm': 'nb-odm', 'aio-mini': 'aio-mini',
  hyper: 'hyperscaler', telco: 'telco', gov: 'gov', idc: 'gov',
  'pc-retail': 'pc-retail', 'pc-diy': 'pc-diy', 'pc-enterprise': 'pc-enterprise',
  'pc-education': 'pc-education', 'pc-gaming': 'pc-gaming',
}

function nodeNews(nodeId) {
  if (!chainImpact.value) return []
  const subKey = NODE_TO_SUB[nodeId]
  if (!subKey) return []
  for (const l of chainImpact.value.layers || []) {
    const sub = l.subCategories?.find(s => s.key === subKey)
    if (sub?.articles?.length) return sub.articles
  }
  return []
}

// 节点 → 参考价格 sparkline：从 bom.products[*].components 里聚合同类部件（第一个匹配）
const NODE_TO_PART_PATTERNS = {
  cpu: [/^CPU/i, /^SoC/i], gpu: [/^GPU/i], mem: [/^HBM/i], storage: [/^NVMe SSD/i],
  power: [/电源/, /散热/], pcb: [/PCB/i],
  'pc-cpu': [/Ryzen/, /Core Ultra/, /CPU/],
  'pc-gpu-aic': [/RTX/, /GPU/i, /^GPU/i],
  mb: [/主板/],
  'ram-diy': [/DDR5/, /内存/],
  'ssd-consumer': [/SSD/, /NVMe/],
  'case-cooler': [/机箱/, /散热/],
  monitor: [/屏/, /显示/, /OLED/],
}

function nodePrice(nodeId) {
  const patterns = NODE_TO_PART_PATTERNS[nodeId]
  if (!patterns || !bom.value?.products) return null
  for (const p of bom.value.products) {
    for (const c of p.components || []) {
      if (patterns.some(re => re.test(c.part)) && c.priceHistory) {
        return { part: c.part, ...c.priceHistory }
      }
    }
  }
  return null
}

// 节点 → 建议动作：从 bom.componentNewsImpact 里找匹配的 component
function nodeAction(nodeId) {
  const patterns = NODE_TO_PART_PATTERNS[nodeId]
  if (!patterns || !bom.value?.componentNewsImpact) return null
  for (const n of bom.value.componentNewsImpact) {
    if (patterns.some(re => re.test(n.component))) {
      // 简单启发式：根据 priceDelta 生成建议
      const isDown = /^-/.test(n.priceDelta) || n.priceDelta?.includes('降')
      const isUp = /^\+/.test(n.priceDelta) && !n.priceDelta.includes('-')
      if (isDown) return `${n.priceDelta}降价窗口 · 建议 ${n.impactStartAt || ''} 开始批量备货，前台调价放宽 3-5%`
      if (isUp) return `${n.priceDelta}涨价压力 · 建议提前备货 ${n.impactStartAt || ''}，前台调价预留 2-3%`
      return `${n.trend} · ${n.priceDelta}`
    }
  }
  return null
}

const currentBom = computed(() => bom.value?.products?.find(p => p.id === currentBomId.value))

function trendArrow(t) { return { up: '↑', down: '↓', flat: '→' }[t] || '·' }
function trendType(t) { return t === 'up' ? 'danger' : t === 'down' ? 'success' : 'info' }
function trendIcon(t) { return t === 'up' ? '↑' : t === 'down' ? '↓' : '→' }
function layerIcon(name) {
  if (name?.includes('上游')) return 'UP'
  if (name?.includes('中游')) return 'MID'
  if (name?.includes('下游')) return 'DOWN'
  return '·'
}
function formatNum(n) { return typeof n === 'number' ? n.toLocaleString() : n }
function levelType(l) { return { high: 'danger', mid: 'warning', low: 'info' }[l] || 'info' }
function levelLabel(l) { return { high: '高', mid: '中', low: '低' }[l] || l }
function deltaType(d) {
  if (!d) return 'info'
  if (d.startsWith('+')) return 'danger'
  if (d.startsWith('-')) return 'success'
  return 'info'
}

async function reloadChainImpact() {
  try { chainImpact.value = await fetchNewsChainImpact(chainImpactDays.value) } catch {}
}

async function reloadAll() {
  chain.value = await fetchSupplyChain()
  bom.value = await fetchBom()
  macroPolicy.value = await fetchMacroPolicy()
  await reloadChainImpact()
}

onMounted(reloadAll)
watch(chainImpactDays, reloadChainImpact)
watch(() => bus.ingestVersion, reloadAll)
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
  margin-bottom: 12px;
  font-size: 13px;
}

.small { font-size: 12px; }
.section-title { font-size: 18px; font-weight: 600; }

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

/* === 顶部动态摘要 === */
.summary-panel {
  background: linear-gradient(135deg, #fff 0%, #f0fdfa 100%);
  border: 1px solid #99f6e4;
  margin-bottom: 16px;
}

.badge-live {
  display: inline-block;
  background: #0d9488;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  vertical-align: 3px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.summary-col {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 12px 14px;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.col-icon { font-size: 18px; }

.summary-col ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
  font-size: 12.5px;
}
.summary-col li { margin-bottom: 5px; }

.bullet-link {
  color: var(--c-text);
  text-decoration: none;
}
.bullet-link:hover { color: var(--c-primary); text-decoration: underline; }

.bullet-tag {
  display: inline-block;
  padding: 1px 6px;
  margin-right: 4px;
  background: rgba(47, 84, 235, 0.08);
  color: var(--c-primary);
  font-size: 11px;
  border-radius: 3px;
  font-weight: 600;
}

.bullet-meta { margin-left: 4px; }

/* === 三大 section === */
.layer-section {
  margin-bottom: 20px;
  border-top: 3px solid #cbd5e1;
}
.layer-section.layer-upstream { border-top-color: #2563eb; }
.layer-section.layer-mid { border-top-color: #f59e0b; }
.layer-section.layer-downstream { border-top-color: #16a34a; }

.layer-head {
  padding-bottom: 10px;
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--c-border);
}

.node-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}

.node-card {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  transition: box-shadow 0.2s;
}
.node-card:hover { box-shadow: var(--shadow-sm); }

.node-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.node-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--c-text);
}

.mini-shares {
  margin-bottom: 8px;
}

.mini-row {
  margin-bottom: 6px;
  font-size: 12px;
}

.mini-name-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 3px;
}

.mini-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.mini-metric {
  font-weight: 600;
  font-size: 12px;
}

.mini-change {
  font-weight: normal;
  font-size: 11px;
  margin-left: 4px;
}
.mini-change.trend-up { color: #16a34a; }
.mini-change.trend-down { color: #dc2626; }
.mini-change.trend-flat { color: var(--c-muted); }

.mini-bar-track {
  height: 5px;
  background: var(--c-bg);
  border-radius: 3px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  background: #2f54eb;
  transition: width 0.4s;
}
.mini-bar-fill.trend-up { background: #16a34a; }
.mini-bar-fill.trend-down { background: #dc2626; }
.mini-bar-fill.trend-flat { background: #2f54eb; }

.mini-title {
  font-weight: 600;
  font-size: 12px;
  margin: 8px 0 4px;
  color: var(--c-text);
}

.node-news, .node-price, .node-action, .node-change {
  padding: 6px 8px;
  background: #fafaf9;
  border-radius: 5px;
  margin-top: 6px;
  font-size: 12px;
}
.node-news { background: rgba(37, 99, 235, 0.04); }
.node-price { background: rgba(22, 163, 74, 0.05); }
.node-action { background: rgba(220, 38, 38, 0.05); }

.news-row {
  display: grid;
  grid-template-columns: 66px 1fr auto;
  gap: 6px;
  align-items: baseline;
  padding: 4px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: inherit;
  font-size: 12px;
}
.news-row:hover { background: rgba(13, 148, 136, 0.03); }
.news-row:last-child { border-bottom: none; }

.news-date {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 11px;
}
.news-title {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}
.news-source {
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price-part { flex-shrink: 0; }

.action-content {
  padding: 4px 6px;
  background: #fff;
  border-radius: 4px;
  line-height: 1.5;
}

.node-change {
  background: rgba(19, 194, 194, 0.06);
  line-height: 1.6;
}

.src-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 4px;
  font-size: 11px;
  color: var(--c-primary);
}

/* === 政策部分（从 HomeView 精简搬来）=== */
.policy {
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  border: 1px solid #bfdbfe;
}

.policy-head { margin-bottom: 12px; }

.badge-policy {
  display: inline-block;
  background: #1d4ed8;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  vertical-align: 3px;
}

.policy-headline {
  padding: 12px 14px;
  background: rgba(29, 78, 216, 0.06);
  border-left: 3px solid #1d4ed8;
  border-radius: 6px;
  margin-bottom: 12px;
  line-height: 1.7;
}

.policy-directions {
  margin: 8px 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--c-muted);
}
.policy-directions li { margin-bottom: 2px; }

.local-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.local-card {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-left: 3px solid #1d4ed8;
  border-radius: var(--radius);
  font-size: 12px;
  line-height: 1.7;
}

.local-city {
  font-weight: 600;
  font-size: 13px;
  color: #1d4ed8;
}

.local-title {
  font-weight: 600;
  margin: 4px 0 6px;
  font-size: 14px;
}

.local-amount {
  font-weight: 600;
  color: #16a34a;
  margin-bottom: 4px;
}

.startup-card { border-left-color: #7c3aed; }
.startup-card .local-city { color: #7c3aed; }

.startup-block {
  margin-top: 6px;
  padding: 6px 8px;
  background: rgba(124, 58, 237, 0.06);
  border-radius: 4px;
}
.startup-block ul {
  margin: 3px 0 0;
  padding-left: 18px;
}

.corp-card {
  border-left-color: #dc2626 !important;
}
.corp-name { color: #dc2626 !important; }

.startup-hl {
  margin: 6px 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.7;
}
.startup-hl li { margin-bottom: 2px; }

.signal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.signal-card {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  font-size: 12px;
}

.signal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 6px;
}

.signal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
}

.signal-impact {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(19, 194, 194, 0.06);
  border-radius: 4px;
  line-height: 1.6;
}

.src-link {
  display: inline-block;
  margin-top: 4px;
  color: var(--c-primary);
  font-size: 11px;
  word-break: break-all;
  text-decoration: none;
}
.src-link:hover { text-decoration: underline; }

/* === 监管影响 === */
.reg-block { padding: 0 4px; }
.reg-note {
  padding: 8px 12px;
  margin-bottom: 12px;
  background: rgba(37, 99, 235, 0.06);
  border-left: 3px solid #2563eb;
  border-radius: 4px;
  line-height: 1.7;
}
.reg-net {
  padding: 12px 14px;
  margin-bottom: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 60%, #fef2f2 100%);
  border: 1px solid #fed7aa;
  border-radius: var(--radius);
}
.reg-net-title {
  font-weight: 700;
  font-size: 14px;
  color: #7c2d12;
  margin-bottom: 8px;
  line-height: 1.5;
}
.reg-net-logic {
  margin: 0 0 10px;
  padding-left: 20px;
  line-height: 1.85;
  font-size: 12.5px;
}
.reg-net-action {
  padding: 8px 10px;
  background: rgba(220, 38, 38, 0.06);
  border-left: 3px solid #dc2626;
  border-radius: 4px;
}
.reg-net-action-title {
  font-weight: 600;
  font-size: 12.5px;
  color: #991b1b;
  margin-bottom: 4px;
}
.reg-net-action ul {
  margin: 2px 0 0;
  padding-left: 18px;
  line-height: 1.7;
  font-size: 12px;
}

.reg-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.reg-col {
  padding: 10px;
  border-radius: var(--radius);
}
.reg-col.positive { background: rgba(22, 163, 74, 0.06); border: 1px solid #86efac; }
.reg-col.negative { background: rgba(220, 38, 38, 0.06); border: 1px solid #fca5a5; }

.reg-col-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.reg-col-title { font-weight: 700; font-size: 15px; }

.reg-card {
  padding: 10px 12px;
  background: #fff;
  border-radius: var(--radius);
  border-left: 3px solid transparent;
  margin-bottom: 8px;
  font-size: 12.5px;
}
.reg-positive { border-left-color: #16a34a; }
.reg-negative { border-left-color: #dc2626; }

.reg-card-title {
  font-weight: 600;
  font-size: 13.5px;
  margin-bottom: 4px;
  line-height: 1.5;
}

.reg-section {
  margin-top: 6px;
  padding: 6px 8px;
  background: #fafafa;
  border-radius: 4px;
}
.reg-section ul {
  margin: 3px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.7;
}
.reg-section b { font-size: 12px; }

/* === 美国出口管制 === */
.us-impact {
  padding: 12px 14px;
  background: linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
  border-radius: var(--radius);
  margin-bottom: 14px;
}

.us-headline {
  font-weight: 600;
  font-size: 13.5px;
  color: #991b1b;
  margin-bottom: 10px;
  line-height: 1.6;
}

.us-impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 960px) { .us-impact-grid { grid-template-columns: 1fr; } }

.us-impact-cell {
  padding: 10px 12px;
  background: #fff;
  border-radius: 6px;
  border-left: 3px solid #dc2626;
  font-size: 12px;
}
.us-impact-cell ul {
  margin: 4px 0 0;
  padding-left: 18px;
  line-height: 1.7;
}

.us-timeline { margin-top: 8px; }

.us-timeline-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
  color: #7c2d12;
}

.us-event {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 10px;
  padding: 10px 4px;
  border-left: 2px dashed #fca5a5;
  margin-left: 10px;
  position: relative;
}

.us-event::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dc2626;
  border: 2px solid #fff;
}

.us-phase-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #dc2626;
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}

.us-date { font-size: 12px; color: #7c2d12; font-weight: 600; }

.us-event-body {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  font-size: 12.5px;
}

.us-event-title {
  font-weight: 600;
  font-size: 13.5px;
  color: #991b1b;
  margin-bottom: 4px;
}

.us-scope {
  margin: 6px 0;
  line-height: 1.6;
}
.us-scope ul {
  margin: 3px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.6;
}

.us-impact-line {
  margin-top: 6px;
  padding: 6px 8px;
  background: rgba(220, 38, 38, 0.06);
  border-radius: 4px;
  line-height: 1.6;
}

.us-response {
  margin: 6px 0;
  padding: 6px 8px;
  background: rgba(22, 163, 74, 0.08);
  border-radius: 4px;
  line-height: 1.6;
  color: #14532d;
}

@media (max-width: 960px) {
  .summary-grid { grid-template-columns: 1fr; }
  .reg-two-col { grid-template-columns: 1fr; }
  .us-event { grid-template-columns: 1fr; }
}
</style>
