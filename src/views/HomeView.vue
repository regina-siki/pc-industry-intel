<template>
  <div class="home">
    <!-- 顶部大标语 + 更新时间 -->
    <div class="panel hero" v-if="overview">
      <div>
        <h1 class="hero-title">服务器 & AI 硬件市场结构化观察</h1>
        <p class="muted small">
          面向京东电脑数码 &amp; 京东云决策 · 分析更新于 {{ overview.updatedAt }}
        </p>
      </div>
      <router-link to="/news" class="cta">进入资讯 →</router-link>
    </div>

    <!-- 四象限结构化影响总结 -->
    <div class="quad-grid" v-if="overview?.summary">
      <div
        v-for="(s, key) in overview.summary"
        :key="key"
        class="panel quad"
        :class="`quad-${key}`"
      >
        <div class="quad-head">
          <span class="quad-icon">{{ quadIcon(key) }}</span>
          <h3 class="quad-title">{{ s.title }}</h3>
        </div>
        <ul class="quad-list">
          <li v-for="(h, i) in s.highlights" :key="i">{{ h }}</li>
        </ul>
        <div class="src-tag" v-if="s.source">来源：{{ s.source }}</div>
      </div>
    </div>

    <!-- 宏观政策动向 -->
    <div class="panel policy" v-if="macroPolicy">
      <div class="policy-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-policy">政策</span>
            宏观政策动向 · AI 采购支持
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            国家 + 地方 + 采购信号 + 创业激励 + 大厂生态 + 美国出口管制 · 更新于 {{ macroPolicy.updatedAt }}
          </p>
        </div>
      </div>

      <div class="policy-headline">
        📌 {{ macroPolicy.summary.headline }}
        <ul class="policy-directions">
          <li
            v-for="(k, i) in macroPolicy.summary.keyDirections"
            :key="i"
          >{{ k }}</li>
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
            <el-table-column prop="impact" label="对服务器 / AI 硬件的影响" min-width="220" />
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
            <div
              v-for="(l, i) in macroPolicy.local"
              :key="i"
              class="local-card"
            >
              <div class="local-city">📍 {{ l.city }}</div>
              <div class="local-title">{{ l.title }}</div>
              <div class="local-amount">💰 {{ l.amount }}</div>
              <div class="muted small local-date">🗓 {{ l.date }}</div>
              <div class="local-focus muted small">
                <b>方向：</b>{{ l.focus }}
              </div>
              <div class="local-impact muted small">
                <b>影响：</b>{{ l.impact }}
              </div>
              <div class="src-tag">来源：{{ l.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`采购信号 (${macroPolicy.procurementSignals?.length || 0})`"
          name="signals"
        >
          <div class="signal-grid">
            <div
              v-for="(s, i) in macroPolicy.procurementSignals"
              :key="i"
              class="signal-card"
            >
              <div class="signal-title">
                <span class="signal-dot"></span>{{ s.signal }}
              </div>
              <div class="muted small">{{ s.detail }}</div>
              <div class="signal-impact">
                ➡️ <b>{{ s.impact }}</b>
              </div>
              <div class="src-tag">来源：{{ s.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`AI 创业者激励 (${macroPolicy.startupIncentives?.length || 0})`"
          name="startup"
        >
          <div class="startup-grid">
            <div
              v-for="(l, i) in macroPolicy.startupIncentives"
              :key="i"
              class="startup-card"
            >
              <div class="startup-head">
                <div class="startup-region">🚀 {{ l.region }}</div>
                <div class="startup-program">{{ l.program }}</div>
                <div class="startup-meta muted small">
                  <span v-if="l.docNo">📄 <b>文号：</b>{{ l.docNo }}</span>
                  <span v-if="l.documentDate">🗓 <b>发布：</b>{{ l.documentDate }}</span>
                </div>
                <div class="startup-period muted small" v-if="l.period">⏱ 实施周期：{{ l.period }}</div>
              </div>

              <div class="startup-section audience" v-if="l.targetAudience">
                <div class="section-label">👥 面向对象</div>
                <div class="audience-who"><b>群体：</b>{{ l.targetAudience.who }}</div>
                <div v-if="l.targetAudience.criteria?.length" class="audience-criteria">
                  <b>准入门槛：</b>
                  <ul>
                    <li v-for="c in l.targetAudience.criteria" :key="c">{{ c }}</li>
                  </ul>
                </div>
              </div>

              <div class="startup-section funding" v-if="l.funding">
                <div class="section-label">💰 资金支持</div>
                <div class="funding-block" v-if="l.funding.cash?.length">
                  <div class="funding-title">现金 / 补贴</div>
                  <ul>
                    <li v-for="c in l.funding.cash" :key="c">{{ c }}</li>
                  </ul>
                </div>
                <div class="funding-block" v-if="l.funding.equity">
                  <div class="funding-title">股权 / 基金跟投</div>
                  <div>{{ l.funding.equity }}</div>
                </div>
                <div class="funding-block" v-if="l.funding.loanSubsidy">
                  <div class="funding-title">贷款贴息</div>
                  <div>{{ l.funding.loanSubsidy }}</div>
                </div>
              </div>

              <div class="startup-section resources" v-if="l.resources?.length">
                <div class="section-label">🎁 配套资源</div>
                <ul>
                  <li v-for="r in l.resources" :key="r">{{ r }}</li>
                </ul>
              </div>

              <div class="startup-section apply" v-if="l.applyChannel">
                <div class="section-label">📮 申报入口</div>
                <div>{{ l.applyChannel }}</div>
                <div v-if="l.sourceUrl" style="margin-top: 4px">
                  <a
                    :href="l.sourceUrl"
                    target="_blank"
                    rel="noopener"
                    class="src-link"
                  >
                    🔗 官方链接：{{ l.sourceUrl }}
                  </a>
                </div>
              </div>

              <div class="src-tag">来源：{{ l.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`大厂 AI 生态 (${macroPolicy.corpAIPrograms?.length || 0})`"
          name="corp"
        >
          <div class="local-grid">
            <div
              v-for="(c, i) in macroPolicy.corpAIPrograms"
              :key="i"
              class="local-card corp-card"
            >
              <div class="local-city corp-name">🏢 {{ c.company }}</div>
              <div class="local-title">{{ c.program }}</div>
              <ul class="startup-hl">
                <li v-for="h in c.highlights" :key="h">{{ h }}</li>
              </ul>
              <div class="local-focus muted small">
                <b>面向：</b>{{ c.targetPartners }}
              </div>
              <div class="local-amount">💰 {{ c.budget }}</div>
              <div class="src-tag">来源：{{ c.source }}</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`⚖️ 监管影响 · 利好/利空 (${(macroPolicy.regulatoryImpacts?.positives?.length || 0) + (macroPolicy.regulatoryImpacts?.negatives?.length || 0)})`"
          name="regulatory"
        >
          <div v-if="macroPolicy.regulatoryImpacts" class="reg-block">
            <div class="reg-note muted small">
              💡 {{ macroPolicy.regulatoryImpacts.note }}
            </div>

            <div v-if="macroPolicy.regulatoryImpacts.netAssessment" class="reg-net">
              <div class="reg-net-title">
                🎯 {{ macroPolicy.regulatoryImpacts.netAssessment.headline }}
              </div>
              <ul class="reg-net-logic">
                <li
                  v-for="l in macroPolicy.regulatoryImpacts.netAssessment.logic"
                  :key="l"
                >{{ l }}</li>
              </ul>
              <div class="reg-net-action">
                <div class="reg-net-action-title">📣 京东建议动作</div>
                <ul>
                  <li
                    v-for="a in macroPolicy.regulatoryImpacts.netAssessment.actionForJd"
                    :key="a"
                  >{{ a }}</li>
                </ul>
              </div>
            </div>

            <div class="reg-two-col">
              <div class="reg-col positive">
                <div class="reg-col-head">
                  <span class="reg-col-icon">📈</span>
                  <span class="reg-col-title">利好政策</span>
                  <span class="reg-col-tag">
                    {{ macroPolicy.regulatoryImpacts.positives?.length }} 条
                  </span>
                </div>
                <div
                  v-for="(p, i) in macroPolicy.regulatoryImpacts.positives"
                  :key="i"
                  class="reg-card reg-positive"
                >
                  <div class="reg-card-head">
                    <span class="reg-card-badge">利好</span>
                    <div class="reg-card-title">{{ p.title }}</div>
                  </div>
                  <div class="reg-meta muted small">
                    <span>🏛 <b>{{ p.issuer }}</b></span>
                    <span>🗓 {{ p.date }}</span>
                  </div>
                  <div class="reg-section" v-if="p.action?.length">
                    <div class="reg-section-title">📜 政策动作</div>
                    <ul>
                      <li v-for="a in p.action" :key="a">{{ a }}</li>
                    </ul>
                  </div>
                  <div class="reg-section" v-if="p.productImpact?.length">
                    <div class="reg-section-title">🛠 对产品的影响</div>
                    <ul>
                      <li v-for="pi in p.productImpact" :key="pi">{{ pi }}</li>
                    </ul>
                  </div>
                  <div class="reg-section" v-if="p.usageImpact?.length">
                    <div class="reg-section-title">👤 对使用的影响</div>
                    <ul>
                      <li v-for="ui in p.usageImpact" :key="ui">{{ ui }}</li>
                    </ul>
                  </div>
                  <div class="src-tag">来源：{{ p.source }}</div>
                </div>
              </div>

              <div class="reg-col negative">
                <div class="reg-col-head">
                  <span class="reg-col-icon">📉</span>
                  <span class="reg-col-title">利空政策</span>
                  <span class="reg-col-tag">
                    {{ macroPolicy.regulatoryImpacts.negatives?.length }} 条
                  </span>
                </div>
                <div
                  v-for="(n, i) in macroPolicy.regulatoryImpacts.negatives"
                  :key="i"
                  class="reg-card reg-negative"
                >
                  <div class="reg-card-head">
                    <span class="reg-card-badge neg">利空</span>
                    <div class="reg-card-title">{{ n.title }}</div>
                  </div>
                  <div class="reg-meta muted small">
                    <span>🏛 <b>{{ n.issuer }}</b></span>
                    <span>🗓 {{ n.date }}</span>
                  </div>
                  <div class="reg-section" v-if="n.action?.length">
                    <div class="reg-section-title">📜 政策动作</div>
                    <ul>
                      <li v-for="a in n.action" :key="a">{{ a }}</li>
                    </ul>
                  </div>
                  <div class="reg-section" v-if="n.productImpact?.length">
                    <div class="reg-section-title">🛠 对产品的影响</div>
                    <ul>
                      <li v-for="pi in n.productImpact" :key="pi">{{ pi }}</li>
                    </ul>
                  </div>
                  <div class="reg-section" v-if="n.usageImpact?.length">
                    <div class="reg-section-title">👤 对使用的影响</div>
                    <ul>
                      <li v-for="ui in n.usageImpact" :key="ui">{{ ui }}</li>
                    </ul>
                  </div>
                  <div class="src-tag">来源：{{ n.source }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          :label="`🇺🇸 美国出口管制 (${macroPolicy.usRestrictions?.length || 0})`"
          name="us"
        >
          <div class="us-impact" v-if="macroPolicy.usRestrictionImpact">
            <div class="us-headline">
              🔎 {{ macroPolicy.usRestrictionImpact.headline }}
            </div>
            <div class="us-impact-grid">
              <div class="us-impact-cell short">
                <div class="us-impact-title">⚡ 短期影响 (2024-2026)</div>
                <ul>
                  <li
                    v-for="s in macroPolicy.usRestrictionImpact.shortTerm"
                    :key="s"
                  >{{ s }}</li>
                </ul>
              </div>
              <div class="us-impact-cell long">
                <div class="us-impact-title">🔭 中长期影响 (2027+)</div>
                <ul>
                  <li
                    v-for="l in macroPolicy.usRestrictionImpact.longTerm"
                    :key="l"
                  >{{ l }}</li>
                </ul>
              </div>
              <div class="us-impact-cell bene">
                <div class="us-impact-title">🚀 国产受益方</div>
                <ul>
                  <li
                    v-for="b in macroPolicy.usRestrictionImpact.beneficiaries"
                    :key="b"
                  >{{ b }}</li>
                </ul>
              </div>
              <div class="us-impact-cell risk">
                <div class="us-impact-title">⚠️ 潜在风险</div>
                <ul>
                  <li
                    v-for="r in macroPolicy.usRestrictionImpact.risks"
                    :key="r"
                  >{{ r }}</li>
                </ul>
              </div>
            </div>
            <div class="src-tag" style="margin-top: 6px">
              综合来源：{{ macroPolicy.usRestrictionImpact.source }}
            </div>
          </div>

          <div class="us-timeline">
            <div class="us-timeline-title">📜 关键出口管制事件时间轴</div>
            <div
              v-for="(u, i) in macroPolicy.usRestrictions"
              :key="i"
              class="us-event"
            >
              <div class="us-event-marker">
                <div class="us-phase-badge">{{ u.phase }}</div>
                <div class="us-date">{{ u.date }}</div>
              </div>
              <div class="us-event-body">
                <div class="us-event-title">🇺🇸 {{ u.title }}</div>
                <div class="us-issuer muted small">
                  <b>发布方：</b>{{ u.issuer }}
                </div>
                <div class="us-scope">
                  <b>管制范围：</b>
                  <template v-if="Array.isArray(u.scope)">
                    <ul class="us-scope-list">
                      <li v-for="(s, si) in u.scope" :key="si">{{ s }}</li>
                    </ul>
                  </template>
                  <span v-else>{{ u.scope }}</span>
                </div>
                <div class="us-impact-line">
                  <b>对中国服务器产业链影响：</b>{{ u.impact }}
                </div>
                <div class="us-response">
                  🇨🇳 <b>中方响应：</b>{{ u.chinaResponse }}
                </div>
                <div class="src-tag">来源：{{ u.source }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 京东渠道落地建议 -->
    <div class="panel jd" v-if="overview?.jdRecommendations">
      <div class="jd-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge">京东</span>
            {{ overview.jdRecommendations.title }}
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            {{ overview.jdRecommendations.subtitle }}
          </p>
        </div>
        <div class="jd-filter">
          <el-radio-group v-model="priorityFilter" size="small">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="high">重点</el-radio-button>
            <el-radio-button label="mid">常规</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="reco-grid">
        <div
          v-for="(r, i) in filteredRecos"
          :key="i"
          class="reco-card"
          :class="`prio-${r.priority}`"
        >
          <div class="reco-head">
            <el-tag :type="categoryType(r.category)" size="small" effect="dark">
              {{ r.category }}
            </el-tag>
            <el-tag :type="prioType(r.priority)" size="small">
              {{ prioLabel(r.priority) }}
            </el-tag>
          </div>
          <div class="reco-title">{{ r.title }}</div>
          <div class="muted small reco-detail">{{ r.detail }}</div>
          <div class="reco-meta">
            <div>
              <span class="muted small">周期：</span>
              <b>{{ r.effort }}</b>
            </div>
            <div>
              <span class="muted small">关键指标：</span>
              <b>{{ r.kpi }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-links">
      <router-link to="/news" class="ql-card">
        <span class="ql-icon">📰</span>
        <span class="ql-title">资讯</span>
        <span class="muted small">RSS + 公众号 + 产业链分层</span>
      </router-link>
      <router-link to="/product" class="ql-card">
        <span class="ql-icon">📊</span>
        <span class="ql-title">产品</span>
        <span class="muted small">技术迭代与趋势</span>
      </router-link>
      <router-link to="/cost" class="ql-card">
        <span class="ql-icon">💰</span>
        <span class="ql-title">成本·BOM</span>
        <span class="muted small">零部件价格影响 + BOM 预测</span>
      </router-link>
      <router-link to="/segments" class="ql-card">
        <span class="ql-icon">👥</span>
        <span class="ql-title">客户细分</span>
        <span class="muted small">Capex + 集采 + 政府 AI 采购</span>
      </router-link>
      <router-link to="/supply-chain" class="ql-card">
        <span class="ql-icon">🔗</span>
        <span class="ql-title">产业链</span>
        <span class="muted small">上中下游 + 市场份额</span>
      </router-link>
    </div>

    <!-- 资讯收集情况（底部） -->
    <div class="panel ingest-panel" v-if="newsStats">
      <div class="ingest-head">
        <h3 style="margin: 0">资讯收集情况</h3>
        <span class="muted small">
          来源：RSS 自动抓取 + 公众号手工入库
        </span>
      </div>
      <div class="ingest-main">
        <div class="ingest-metric">
          <div class="muted small">已收录资讯</div>
          <div class="metric-value">{{ newsStats.total }}</div>
        </div>
        <div class="ingest-metric">
          <div class="muted small">最新入库</div>
          <div class="metric-value">
            {{ formatDateTime(newsStats.latestFetchedAt) }}
          </div>
          <div class="muted small">{{ relativeTime(newsStats.latestFetchedAt) }}</div>
        </div>
        <div class="ingest-metric">
          <div class="muted small">最新发布日期</div>
          <div class="metric-value">
            {{ formatDate(newsStats.latestPublishedAt) }}
          </div>
        </div>
        <div class="ingest-sources">
          <div class="muted small" style="margin-bottom: 4px">来源分布</div>
          <div class="src-tags">
            <el-tag
              v-for="s in (newsStats.bySource || []).slice(0, 6)"
              :key="s.source"
              size="small"
              style="margin-right: 4px; margin-bottom: 4px"
            >
              {{ s.source }} · {{ s.count }}
            </el-tag>
            <span
              class="muted small"
              v-if="(newsStats.bySource || []).length > 6"
            >
              +{{ newsStats.bySource.length - 6 }} 家
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchOverview, fetchNewsStats, fetchMacroPolicy } from '@/api'
import { useBus } from '@/stores/bus'

const overview = ref(null)
const newsStats = ref(null)
const macroPolicy = ref(null)
const priorityFilter = ref('')
const policyTab = ref('national')
const bus = useBus()

const filteredRecos = computed(() => {
  const items = overview.value?.jdRecommendations?.items || []
  if (!priorityFilter.value) return items
  return items.filter((r) => r.priority === priorityFilter.value)
})

function quadIcon(key) {
  return { product: '📦', cost: '💰', customer: '👥', demand: '💡' }[key] || '·'
}
function prioType(p) {
  return { high: 'danger', mid: 'warning', low: 'info' }[p] || 'info'
}
function prioLabel(p) {
  return { high: '重点', mid: '常规', low: '备选' }[p] || p
}
function categoryType(c) {
  const map = { 选品: 'primary', 内容: 'success', 金融: 'warning', B端: 'danger', 服务: 'info', 供应链: 'primary', 预警: 'warning' }
  return map[c] || 'info'
}

function formatDate(iso) {
  if (!iso) return '—'
  return String(iso).slice(0, 10)
}
function formatDateTime(iso) {
  if (!iso) return '—'
  // "2026-07-02 14:32:11" 或 ISO 均转成本地可读格式
  const s = String(iso).replace('T', ' ').replace(/\.\d+Z?$/, '')
  return s.slice(0, 16) // 到分钟
}
function relativeTime(iso) {
  if (!iso) return ''
  const t = new Date(String(iso).replace(' ', 'T') + (String(iso).includes('Z') ? '' : 'Z')).getTime()
  if (isNaN(t)) return ''
  const diffMin = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH} 小时前`
  const diffD = Math.round(diffH / 24)
  return `${diffD} 天前`
}

onMounted(async () => {
  overview.value = await fetchOverview()
  try {
    newsStats.value = await fetchNewsStats()
  } catch {
    /* 静默失败 */
  }
  try {
    macroPolicy.value = await fetchMacroPolicy()
  } catch {
    /* 静默失败 */
  }
})

// 公众号入库后自动刷新资讯统计
watch(
  () => bus.ingestVersion,
  async () => {
    try {
      newsStats.value = await fetchNewsStats()
    } catch {
      /* silent */
    }
  },
)
</script>

<style scoped lang="scss">
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f5ff 100%);
  margin-bottom: 16px;
}

.chain-impact {
  padding: 16px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
  border: 1px solid #99f6e4;
}

.chain-impact-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.badge-impact {
  display: inline-block;
  background: #0d9488;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  vertical-align: 3px;
}

.chain-impact-filter { flex-shrink: 0; }

.chain-layer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 960px) {
  .chain-layer-grid { grid-template-columns: 1fr; }
}

.chain-layer-card {
  padding: 12px 14px;
  background: #fff;
  border-radius: var(--radius);
  border-top: 3px solid #0d9488;
  border: 1px solid var(--c-border);
  border-top: 3px solid #0d9488;

  &.layer-upstream { border-top-color: #2563eb; }
  &.layer-mid { border-top-color: #f59e0b; }
  &.layer-downstream { border-top-color: #16a34a; }
}

.chain-layer-head {
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.chain-layer-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.layer-upstream .chain-layer-name { color: #1d4ed8; }
.layer-mid .chain-layer-name { color: #b45309; }
.layer-downstream .chain-layer-name { color: #15803d; }

.chain-layer-metrics {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chain-count {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text);
  line-height: 1;
}

.chain-trend { flex-shrink: 0; }

.chain-empty {
  padding: 12px;
  text-align: center;
  font-style: italic;
}

.chain-sub-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.chain-articles-title {
  margin: 6px 0 4px;
  font-weight: 600;
}

.chain-article-row {
  display: grid;
  grid-template-columns: 82px 1fr auto;
  align-items: baseline;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: inherit;
  transition: background 0.12s;

  &:hover {
    background: rgba(13, 148, 136, 0.05);
    text-decoration: none;
  }

  &:last-child { border-bottom: none; }
}

.chain-article-date {
  flex-shrink: 0;
  font-family: 'SF Mono', Menlo, monospace;
}

.chain-article-title {
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-text);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chain-article-source {
  flex-shrink: 0;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: none; /* moved to NewsView */
}

.chain-impact,
.chain-layer-grid,
.chain-layer-card,
.chain-layer-head,
.chain-layer-name,
.chain-layer-metrics,
.chain-count,
.chain-trend,
.chain-empty,
.chain-sub-tags,
.chain-articles,
.chain-articles-title,
.chain-article-row,
.chain-article-date,
.chain-article-title,
.badge-impact,
.chain-impact-head,
.chain-impact-filter {
  display: none;
}

.ingest-panel {
  padding: 14px 18px;
  margin-top: 16px;
  background: #fff;
  border: 1px solid var(--c-border);
}

.ingest-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.ingest-main {
  display: grid;
  grid-template-columns: repeat(3, auto) 1fr;
  align-items: start;
  gap: 24px;
}

.ingest-metric .metric-value {
  font-size: 18px;
  font-weight: 700;
  margin: 2px 0;
}

.ingest-sources {
  min-width: 0;
}

.src-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

@media (max-width: 960px) {
  .ingest-main {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

.hero-title {
  margin: 0;
  font-size: 22px;
}

.cta {
  padding: 8px 16px;
  background: var(--c-primary);
  color: #fff;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 13px;

  &:hover { opacity: 0.9; }
}

.small { font-size: 12px; }

.quad-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.quad {
  padding: 16px 18px;

  &.quad-product { border-top: 3px solid #2f54eb; }
  &.quad-cost { border-top: 3px solid #f59e0b; }
  &.quad-customer { border-top: 3px solid #13c2c2; }
  &.quad-demand { border-top: 3px solid #722ed1; }
}

.quad-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.quad-icon { font-size: 20px; }

.quad-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.quad-list {
  margin: 0 0 12px;
  padding-left: 20px;
  line-height: 1.9;
  font-size: 13px;

  li { margin-bottom: 4px; }
}

.src-tag {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 4px;
  font-size: 11px;
  color: var(--c-primary);
}

.jd {
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border: 1px solid #fed7aa;
}

.policy {
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  border: 1px solid #bfdbfe;
}

.policy-head {
  margin-bottom: 12px;
}

.badge-policy {
  display: inline-block;
  background: #1d4ed8;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
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

  li { margin-bottom: 2px; }
}

.policy-tabs {
  margin-top: 8px;
}

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
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-sm); }
}

.local-city {
  font-weight: 600;
  font-size: 13px;
  color: #1d4ed8;
}

.local-title {
  font-weight: 600;
  margin: 4px 0 6px;
  font-size: 15px;
}

.local-amount {
  font-weight: 600;
  color: #16a34a;
  margin-bottom: 4px;
}

.local-date,
.local-focus,
.local-impact {
  line-height: 1.6;
  margin-bottom: 4px;
}

.startup-hl {
  margin: 6px 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--c-text);

  li { margin-bottom: 2px; }
}

.startup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 14px;
}

.startup-card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-left: 3px solid #7c3aed;
  border-radius: var(--radius);
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-sm); }
}

.startup-head {
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.startup-region {
  font-weight: 700;
  font-size: 14px;
  color: #7c3aed;
  margin-bottom: 2px;
}

.startup-program {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.startup-period { margin-top: 2px; }

.startup-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 2px 0;
  line-height: 1.6;

  span { display: inline-block; }
}

.src-link {
  display: inline-block;
  color: var(--c-primary);
  font-size: 11.5px;
  word-break: break-all;
  text-decoration: none;

  &:hover { text-decoration: underline; }
}

.startup-section {
  padding: 8px 10px;
  margin-bottom: 8px;
  background: #fafaf9;
  border-radius: 5px;
  font-size: 12.5px;
  line-height: 1.7;

  &.audience { background: rgba(124, 58, 237, 0.06); }
  &.funding { background: rgba(22, 163, 74, 0.07); }
  &.resources { background: rgba(37, 99, 235, 0.06); }
  &.apply { background: rgba(245, 158, 11, 0.08); }

  ul {
    margin: 3px 0 0;
    padding-left: 18px;
  }

  li { margin-bottom: 1px; }
}

.section-label {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--c-text);
}

.audience-who { margin-bottom: 4px; }

.audience-criteria {
  margin-top: 4px;

  ul { margin-top: 2px; }
}

.funding-block {
  margin-bottom: 6px;

  &:last-child { margin-bottom: 0; }
}

.funding-title {
  font-weight: 600;
  font-size: 12.5px;
  color: #15803d;
  margin-bottom: 2px;
}

.corp-card {
  border-left: 3px solid #dc2626 !important;
}
.corp-name {
  color: #dc2626 !important;
}

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
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-sm); }
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
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.signal-impact {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(19, 194, 194, 0.06);
  border-radius: 4px;
  font-size: 13px;
}

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
  padding: 14px 16px;
  margin-bottom: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 60%, #fef2f2 100%);
  border: 1px solid #fed7aa;
  border-radius: var(--radius);
}

.reg-net-title {
  font-weight: 700;
  font-size: 14.5px;
  color: #7c2d12;
  margin-bottom: 8px;
  line-height: 1.5;
}

.reg-net-logic {
  margin: 0 0 10px;
  padding-left: 20px;
  line-height: 1.85;
  font-size: 13px;

  li { margin-bottom: 3px; }
}

.reg-net-action {
  padding: 10px 12px;
  background: rgba(220, 38, 38, 0.06);
  border-left: 3px solid #dc2626;
  border-radius: 4px;
}

.reg-net-action-title {
  font-weight: 600;
  font-size: 13px;
  color: #991b1b;
  margin-bottom: 4px;
}

.reg-net-action ul {
  margin: 2px 0 0;
  padding-left: 18px;
  line-height: 1.75;
  font-size: 12.5px;

  li { margin-bottom: 2px; }
}

.reg-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 960px) {
  .reg-two-col { grid-template-columns: 1fr; }
}

.reg-col {
  padding: 10px;
  border-radius: var(--radius);

  &.positive {
    background: rgba(22, 163, 74, 0.06);
    border: 1px solid #86efac;
  }

  &.negative {
    background: rgba(220, 38, 38, 0.06);
    border: 1px solid #fca5a5;
  }
}

.reg-col-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px 10px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
  margin-bottom: 10px;
}

.reg-col-icon { font-size: 18px; }

.reg-col-title {
  font-weight: 700;
  font-size: 15px;
}

.reg-col.positive .reg-col-title { color: #15803d; }
.reg-col.negative .reg-col-title { color: #991b1b; }

.reg-col-tag {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.reg-col.positive .reg-col-tag { background: #16a34a; color: #fff; }
.reg-col.negative .reg-col-tag { background: #dc2626; color: #fff; }

.reg-card {
  padding: 12px 14px;
  background: #fff;
  border-radius: var(--radius);
  border-left: 3px solid transparent;
  margin-bottom: 10px;

  &:last-child { margin-bottom: 0; }
}

.reg-positive { border-left-color: #16a34a; }
.reg-negative { border-left-color: #dc2626; }

.reg-card-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.reg-card-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  background: #16a34a;
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;

  &.neg { background: #dc2626; }
}

.reg-card-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  color: var(--c-text);
}

.reg-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 4px 0 8px;
  line-height: 1.6;
}

.reg-section {
  margin-top: 8px;
  padding: 6px 8px;
  background: #fafafa;
  border-radius: 4px;
}

.reg-section-title {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--c-text);
  margin-bottom: 2px;
}

.reg-section ul {
  margin: 3px 0 0;
  padding-left: 18px;
  font-size: 12.5px;
  line-height: 1.75;

  li { margin-bottom: 1px; }
}

.us-impact {
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
  border-radius: var(--radius);
  margin-bottom: 14px;
}

.us-headline {
  font-weight: 600;
  font-size: 14px;
  color: #991b1b;
  margin-bottom: 10px;
  line-height: 1.6;
}

.us-impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 960px) {
  .us-impact-grid { grid-template-columns: 1fr; }
}

.us-impact-cell {
  padding: 10px 12px;
  background: #fff;
  border-radius: 6px;
  border-left: 3px solid #dc2626;

  &.short { border-left-color: #f59e0b; }
  &.long { border-left-color: #2563eb; }
  &.bene { border-left-color: #16a34a; }
  &.risk { border-left-color: #dc2626; }

  ul {
    margin: 4px 0 0;
    padding-left: 18px;
    font-size: 12.5px;
    line-height: 1.7;
    color: var(--c-text);
  }
}

.us-impact-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--c-text);
  margin-bottom: 2px;
}

.us-timeline {
  margin-top: 8px;
  padding: 4px 0;
}

.us-timeline-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: #7c2d12;
  padding-left: 4px;
}

.us-event {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  padding: 12px 14px 12px 4px;
  border-left: 2px dashed #fca5a5;
  margin-left: 12px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 16px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #dc2626;
    border: 2px solid #fff;
  }

  & + .us-event { margin-top: 2px; }
}

.us-event-marker {
  padding-top: 2px;
}

.us-phase-badge {
  display: inline-block;
  padding: 3px 8px;
  background: #dc2626;
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.us-date {
  font-size: 12px;
  color: #7c2d12;
  font-weight: 600;
}

.us-event-body {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
}

.us-event-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #991b1b;
}

.us-issuer { margin-bottom: 4px; }

.us-scope {
  margin: 6px 0;
  font-size: 13px;
  line-height: 1.7;
}

.us-scope-list {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 12.5px;
  color: var(--c-text);

  li { margin-bottom: 1px; }
}

.us-impact-line {
  margin-top: 6px;
  padding: 6px 8px;
  background: rgba(220, 38, 38, 0.06);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.us-response {
  margin: 6px 0;
  padding: 6px 8px;
  background: rgba(22, 163, 74, 0.08);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #14532d;
}

@media (max-width: 720px) {
  .us-event { grid-template-columns: 1fr; }
}

.jd-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  background: #e11d48;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  vertical-align: 3px;
}

.reco-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.reco-card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  &.prio-high { border-left: 3px solid #dc2626; }
  &.prio-mid { border-left: 3px solid #f59e0b; }
}

.reco-head {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.reco-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
}

.reco-detail {
  line-height: 1.7;
  margin-bottom: 10px;
}

.reco-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  border-top: 1px dashed var(--c-border);
  font-size: 13px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.ql-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  color: var(--c-text);
  transition: all 0.2s;

  &:hover {
    border-color: var(--c-primary);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
}

.ql-icon { font-size: 20px; }
.ql-title { font-weight: 600; }

@media (max-width: 960px) {
  .quad-grid { grid-template-columns: 1fr; }
  .reco-grid { grid-template-columns: 1fr; }
  .quick-links { grid-template-columns: repeat(2, 1fr); }
}
</style>
