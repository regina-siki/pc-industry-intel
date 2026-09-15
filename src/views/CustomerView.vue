<template>
  <div>
    <!-- 说明 -->
    <div class="panel notice" v-if="segData?.disclaimer">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ segData.disclaimer }}</span>
    </div>

    <!-- ═══════ Part A · 小 B / 个人 ═══════ -->

    <!-- A-1 Segment 卡：smb + consumer 各一张 -->
    <div class="panel section-panel">
      <div class="section-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-a">Part A</span>
            小 B &amp; 个人 · 增速最高的两个细分
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            个人 (Consumer) + 小 B (SMB) 细分卡 → 分层画像 → 产品/价格/服务 匹配矩阵
          </p>
        </div>
      </div>

      <div class="segment-grid">
        <div
          v-for="s in smbConsumerSegments"
          :key="s.id"
          class="segment prio-high"
        >
          <div class="seg-head">
            <div style="flex: 1">
              <div class="seg-name">{{ s.name }}
                <el-tag type="danger" size="small" effect="dark">优先</el-tag>
              </div>
              <div class="muted small">{{ s.focus }}</div>
            </div>
          </div>
          <div class="seg-body">
            <div class="block">
              <div class="block-title">核心诉求</div>
              <ul class="need-list">
                <li v-for="d in s.topDemands" :key="d">{{ d }}</li>
              </ul>
            </div>
            <div class="block">
              <div class="block-title">代表客户</div>
              <div class="cust-tags">
                <el-tag
                  v-for="c in s.keyCustomers"
                  :key="c"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >{{ c }}</el-tag>
              </div>
              <div v-if="s.insight" class="insight muted small">
                💡 {{ s.insight }}
                <div v-if="s.insightSource" class="src-tag">
                  来源：{{ s.insightSource }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- A-2 小 B/个人 洞察卡 -->
    <div class="panel highlight" v-if="segData?.smbAndConsumerInsights">
      <h3 style="margin-top: 0">
        <span class="badge">重点</span>
        趋势洞察
      </h3>
      <div class="insight-grid">
        <div
          v-for="(ins, i) in segData.smbAndConsumerInsights"
          :key="i"
          class="insight-card"
        >
          <div class="insight-title">{{ ins.title }}</div>
          <div class="muted small" style="line-height: 1.7">{{ ins.detail }}</div>
          <div v-if="ins.source" class="src-tag">来源：{{ ins.source }}</div>
        </div>
      </div>
    </div>

    <!-- A-3 消费者画像 5 卡 -->
    <PersonaGrid
      v-if="segData?.consumerPersonas"
      :group="segData.consumerPersonas"
      accent="consumer"
    />

    <!-- A-4 小 B 画像 5 卡 -->
    <PersonaGrid
      v-if="segData?.smbPersonas"
      :group="segData.smbPersonas"
      accent="smb"
    />

    <!-- A-5 匹配矩阵 12 行 -->
    <div class="panel intro" v-if="matchData">
      <div>
        <h2 class="section-title" style="margin: 0">
          <span class="badge-match">匹配</span>
          个人 &amp; 小 B · 产品 / 价格 / 服务 匹配矩阵
        </h2>
        <p class="muted small" style="margin: 4px 0 0">{{ matchData.note }}</p>
      </div>
      <div class="filter">
        <el-radio-group v-model="kindFilter" size="default">
          <el-radio-button label="">全部 ({{ matchData.matches.length }})</el-radio-button>
          <el-radio-button label="consumer">个人 ({{ consumerCount }})</el-radio-button>
          <el-radio-button label="smb">小 B ({{ smbCount }})</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="match-list" v-if="matchData">
      <div
        v-for="m in filteredMatches"
        :key="m.personaTier"
        class="match-card"
        :class="`kind-${m.kind}`"
      >
        <div class="mc-head">
          <div class="mc-avatar">{{ m.avatar }}</div>
          <div style="flex: 1">
            <div class="mc-tier">{{ m.personaTier }}</div>
            <div class="mc-portrait">{{ m.portrait }}</div>
          </div>
          <el-tag :type="m.kind === 'consumer' ? 'danger' : 'primary'" effect="dark">
            {{ m.kind === 'consumer' ? '个人层' : '小 B 层' }}
          </el-tag>
        </div>

        <div class="mc-grid">
          <div class="mc-col motive">
            <div class="col-title">🎯 购买动机</div>
            <div class="col-content">{{ m.motive }}</div>
          </div>
          <div class="mc-col product">
            <div class="col-title">💻 匹配产品线</div>
            <div class="col-content"><b>{{ m.productLine }}</b></div>
            <ul class="col-list">
              <li v-for="s in m.productSpec" :key="s">{{ s }}</li>
            </ul>
          </div>
          <div class="mc-col price">
            <div class="col-title">💰 价格带</div>
            <div class="col-content">
              <div>{{ m.priceRange }}</div>
              <div class="sweet">甜点：<b>{{ m.sweetPrice }}</b></div>
            </div>
          </div>
          <div class="mc-col pain">
            <div class="col-title">😣 核心痛点</div>
            <div class="col-content">{{ m.corePain }}</div>
          </div>
          <div class="mc-col demand">
            <div class="col-title">💡 核心诉求</div>
            <div class="col-content">{{ m.coreDemand }}</div>
          </div>
          <div class="mc-col service">
            <div class="col-title">🎁 服务包设计</div>
            <div class="col-content"><b>{{ m.serviceOffer }}</b></div>
          </div>
        </div>

        <div class="mc-foot">
          <div class="foot-item">
            <span class="muted small">📣 触达渠道：</span>
            <span>{{ m.channelToReach }}</span>
          </div>
          <div class="foot-item">
            <span class="muted small">📊 KPI：</span>
            <b>{{ m.kpi }}</b>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ Part B · 大 B / 政企 ═══════ -->
    <div class="panel section-panel divider">
      <div class="section-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-b">Part B</span>
            大 B / 政企 · 云厂商 · 运营商 · 政府 · 教育
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            8 段客户细分 · 含 Capex / 集采 / 政策 / 已披露采购
          </p>
        </div>
      </div>

      <div class="segment-grid">
        <div
          v-for="s in bigBSegments"
          :key="s.id"
          class="segment"
          :class="`prio-${s.priority}`"
        >
          <div class="seg-head">
            <div style="flex: 1">
              <div class="seg-name">
                {{ s.name }}
                <el-tag v-if="s.priority === 'high'" type="danger" size="small" effect="dark">优先</el-tag>
              </div>
              <div class="muted small">{{ s.focus }}</div>
            </div>
          </div>

          <div class="seg-body">
            <div class="block">
              <div class="block-title">核心诉求</div>
              <ul class="need-list">
                <li v-for="d in s.topDemands" :key="d">{{ d }}</li>
              </ul>
            </div>
            <div class="block">
              <div class="block-title">代表客户</div>
              <div class="cust-tags">
                <el-tag
                  v-for="c in s.keyCustomers"
                  :key="c"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >{{ c }}</el-tag>
              </div>
              <div v-if="s.insight" class="insight muted small">
                💡 {{ s.insight }}
                <div v-if="s.insightSource" class="src-tag">
                  来源：{{ s.insightSource }}
                </div>
              </div>
            </div>
          </div>

          <!-- 云厂商 Capex 表 -->
          <div class="sub-block" v-if="s.capex && s.capex.length">
            <div class="block-title">💰 Capex 与 AI 占比 · 主要整机供应商</div>
            <el-table :data="s.capex" size="small" stripe>
              <el-table-column prop="company" label="公司" width="150" />
              <el-table-column prop="period" label="周期" width="140" />
              <el-table-column prop="amount" label="金额" width="130" />
              <el-table-column prop="aiShare" label="AI 占比" width="100">
                <template #default="{ row }">
                  <el-tag type="warning" size="small">{{ row.aiShare }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="整机供应商" min-width="220">
                <template #default="{ row }">
                  <el-tag
                    v-for="v in (row.serverVendors || [])"
                    :key="v"
                    size="small"
                    type="primary"
                    style="margin: 0 4px 3px 0"
                  >{{ v }}</el-tag>
                  <div v-if="row.vendorNote" class="muted small" style="margin-top: 2px">
                    {{ row.vendorNote }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="来源" min-width="180">
                <template #default="{ row }">
                  <span class="muted small">{{ row.source }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 已披露采购 -->
          <div class="sub-block" v-if="s.recentDeals && s.recentDeals.length">
            <div class="block-title">📋 已披露采购 · 中标厂商 &amp; 份额</div>
            <el-table :data="s.recentDeals" size="small" stripe>
              <el-table-column prop="customer" label="采购人" width="120" />
              <el-table-column prop="title" label="公告标题" min-width="220" />
              <el-table-column prop="scale" label="规模" width="110" />
              <el-table-column prop="amount" label="金额" width="120" />
              <el-table-column label="中标厂商" min-width="240">
                <template #default="{ row }">
                  <div v-if="row.winners && row.winners.length" class="winner-list">
                    <div
                      v-for="(w, wi) in row.winners"
                      :key="wi"
                      class="winner-row"
                    >
                      <el-tag size="small" type="success">{{ w.vendor }}</el-tag>
                      <span class="winner-share">{{ w.share }}</span>
                      <span v-if="w.quantity && w.quantity !== '—'" class="muted small">
                        · {{ w.quantity }}
                      </span>
                    </div>
                  </div>
                  <span v-else class="muted small">未披露</span>
                </template>
              </el-table-column>
              <el-table-column label="来源" min-width="150">
                <template #default="{ row }">
                  <span class="muted small">{{ row.source }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 政府 AI 政策 -->
          <div class="sub-block" v-if="s.govAiPolicy && s.govAiPolicy.length">
            <div class="block-title">🏛️ 政府 AI 政策与补贴</div>
            <el-table :data="s.govAiPolicy" size="small" stripe>
              <el-table-column prop="policy" label="政策名" width="220" />
              <el-table-column prop="date" label="发布" width="100" />
              <el-table-column prop="amount" label="规模 / 金额" width="180" />
              <el-table-column prop="impact" label="影响 / 说明" min-width="240" />
              <el-table-column label="来源" min-width="160">
                <template #default="{ row }">
                  <span class="muted small">{{ row.source }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 政府 AI 采购 -->
          <div class="sub-block" v-if="s.govAiProcurement && s.govAiProcurement.length">
            <div class="block-title">🧾 政府 AI 硬件已披露采购 · 中标厂商</div>
            <el-table :data="s.govAiProcurement" size="small" stripe>
              <el-table-column prop="buyer" label="采购人" width="180" />
              <el-table-column prop="title" label="项目" min-width="200" />
              <el-table-column prop="amount" label="金额" width="120" />
              <el-table-column prop="date" label="时间" width="100" />
              <el-table-column label="规模" width="150">
                <template #default="{ row }">
                  <span>{{ row.quantity || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="中标厂商" min-width="220">
                <template #default="{ row }">
                  <div v-if="row.winners && row.winners.length" class="winner-list">
                    <div
                      v-for="(w, wi) in row.winners"
                      :key="wi"
                      class="winner-row"
                    >
                      <el-tag size="small" type="success">{{ w.vendor }}</el-tag>
                      <span v-if="w.share" class="winner-share">{{ w.share }}</span>
                    </div>
                  </div>
                  <span v-else class="muted small">未披露</span>
                </template>
              </el-table-column>
              <el-table-column label="来源" min-width="150">
                <template #default="{ row }">
                  <span class="muted small">{{ row.source }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ Part C · 京东建议 ═══════ -->
    <div class="panel jd" v-if="jdRecos && jdRecos.length">
      <div class="jd-head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-jd">京东</span>
            {{ overview?.jdRecommendations?.title || '京东渠道落地建议' }}
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            {{ overview?.jdRecommendations?.subtitle }}
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { fetchCustomerSegments, fetchUserMatch, fetchOverview } from '@/api'
import PersonaGrid from '@/components/PersonaGrid.vue'
import { useBus } from '@/stores/bus'

const bus = useBus()
const segData = ref(null)
const matchData = ref(null)
const overview = ref(null)
const kindFilter = ref('')
const priorityFilter = ref('')

// A · 小 B / 个人 = smb + consumer
const smbConsumerSegments = computed(() =>
  (segData.value?.segments || []).filter(s => s.id === 'smb' || s.id === 'consumer'),
)

// B · 大 B / 政企 = 其他 8 段
const bigBSegments = computed(() =>
  (segData.value?.segments || []).filter(s => s.id !== 'smb' && s.id !== 'consumer'),
)

// 匹配矩阵过滤
const filteredMatches = computed(() => {
  const list = matchData.value?.matches || []
  return kindFilter.value ? list.filter(m => m.kind === kindFilter.value) : list
})
const consumerCount = computed(
  () => (matchData.value?.matches || []).filter(m => m.kind === 'consumer').length,
)
const smbCount = computed(
  () => (matchData.value?.matches || []).filter(m => m.kind === 'smb').length,
)

// 京东建议
const jdRecos = computed(() => overview.value?.jdRecommendations?.items || [])
const filteredRecos = computed(() =>
  priorityFilter.value ? jdRecos.value.filter(r => r.priority === priorityFilter.value) : jdRecos.value,
)

function prioType(p) {
  return p === 'high' ? 'danger' : p === 'mid' ? 'warning' : 'info'
}
function prioLabel(p) {
  return p === 'high' ? '重点' : p === 'mid' ? '常规' : '备选'
}
function categoryType(c) {
  const map = { 选品: 'primary', 内容: 'success', 金融: 'warning', B端: 'danger', 服务: 'info', 供应链: 'primary', 预警: 'danger' }
  return map[c] || 'info'
}

async function reload() {
  segData.value = await fetchCustomerSegments()
  matchData.value = await fetchUserMatch()
  overview.value = await fetchOverview()
}

onMounted(reload)
watch(() => bus.ingestVersion, reload)
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

.section-panel {
  margin-bottom: 16px;
}
.section-panel.divider {
  border-top: 3px solid #2563eb;
  padding-top: 20px;
  margin-top: 24px;
}

.section-head {
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px dashed var(--c-border);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
}

.badge-a, .badge-b {
  display: inline-block;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  vertical-align: 3px;
  letter-spacing: 0.5px;
}
.badge-a { background: #c026d3; }
.badge-b { background: #2563eb; }
.badge-jd { background: #e11d48; display: inline-block; color: #fff; font-size: 12px; padding: 3px 10px; border-radius: 4px; margin-right: 8px; font-weight: 600; vertical-align: 3px; }

.badge-match {
  display: inline-block;
  background: #d97706;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  vertical-align: 3px;
}

.small { font-size: 12px; }

.segment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.segment {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 16px;
}

.segment.prio-high { border-left: 3px solid #dc2626; }

.seg-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--c-border);
}

.seg-name {
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.seg-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.block-title {
  font-size: 12px;
  color: var(--c-muted);
  margin-bottom: 6px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.need-list {
  margin: 0;
  padding-left: 16px;
  line-height: 1.8;
  font-size: 13px;
}

.insight {
  margin-top: 10px;
  padding: 8px;
  background: rgba(19, 194, 194, 0.06);
  border-radius: 4px;
  line-height: 1.6;
}

.sub-block { margin-top: 14px; }

.winner-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.winner-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.winner-share {
  font-weight: 600;
  color: var(--c-text);
  font-size: 12px;
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

.highlight {
  margin-top: 16px;
  background: linear-gradient(135deg, #fff 0%, #fff7ed 100%);
  border: 1px dashed #fdba74;
}

.badge {
  display: inline-block;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 6px;
  font-weight: 500;
  vertical-align: 2px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.insight-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 12px 14px;
}

.insight-title {
  font-weight: 600;
  margin-bottom: 6px;
}

/* === 匹配矩阵 === */
.intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
  background: linear-gradient(135deg, #fff 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  flex-wrap: wrap;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.match-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 16px 18px;
}
.match-card.kind-consumer { border-left: 4px solid #c026d3; }
.match-card.kind-smb { border-left: 4px solid #2563eb; }

.mc-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--c-border);
}

.mc-avatar { font-size: 40px; line-height: 1; }

.mc-tier {
  font-size: 12px;
  color: var(--c-muted);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.mc-portrait {
  font-size: 16px;
  font-weight: 600;
  margin-top: 3px;
}

.mc-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.mc-col {
  padding: 10px 12px;
  background: var(--c-bg);
  border-radius: 6px;
  border-top: 3px solid #cbd5e1;
}
.mc-col.motive { border-top-color: #f59e0b; }
.mc-col.product { border-top-color: #2563eb; }
.mc-col.price { border-top-color: #16a34a; }
.mc-col.pain { border-top-color: #dc2626; }
.mc-col.demand { border-top-color: #14b8a6; }
.mc-col.service { border-top-color: #7c3aed; }

.col-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-muted);
  letter-spacing: 0.3px;
  margin-bottom: 6px;
  white-space: nowrap;
}

.col-content {
  font-size: 13px;
  line-height: 1.6;
}

.col-list {
  margin: 6px 0 0;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--c-muted);
}
.col-list li { margin-bottom: 2px; }

.sweet {
  margin-top: 4px;
  color: #16a34a;
  font-size: 12px;
}

.mc-foot {
  padding-top: 10px;
  border-top: 1px dashed var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

/* === 京东建议 === */
.jd {
  margin-top: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border: 1px solid #fed7aa;
}
.jd-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.jd-filter { flex-shrink: 0; }

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
}
.reco-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.reco-card.prio-high { border-left: 3px solid #dc2626; }
.reco-card.prio-mid { border-left: 3px solid #f59e0b; }
.reco-head {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.reco-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  line-height: 1.5;
}
.reco-detail { line-height: 1.7; margin-bottom: 8px; }
.reco-meta {
  padding-top: 8px;
  border-top: 1px dashed var(--c-border);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@media (max-width: 1200px) {
  .mc-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 960px) {
  .seg-body { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .mc-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
