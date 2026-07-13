<template>
  <div>
    <!-- 说明 -->
    <div class="panel notice" v-if="data?.disclaimer">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ data.disclaimer }}</span>
    </div>

    <!-- 顶部：已披露采购动态汇总 -->
    <div class="panel">
      <div class="head">
        <div>
          <h2 class="section-title" style="margin: 0">已披露采购动态</h2>
          <p class="muted small" style="margin: 4px 0 0">
            汇总公开新闻/公告中的重大采购事件；按客户筛选
          </p>
        </div>
        <div style="display: flex; gap: 8px">
          <el-input
            v-model="dealFilter"
            placeholder="按客户名搜索"
            clearable
            size="default"
            style="width: 220px"
            @clear="loadDeals"
            @keyup.enter="loadDeals"
          />
          <el-button type="primary" @click="loadDeals">筛选</el-button>
        </div>
      </div>

      <el-table :data="deals" stripe empty-text="暂无数据">
        <el-table-column prop="period" label="周期" width="120" />
        <el-table-column prop="customer" label="采购人" width="140" show-overflow-tooltip />
        <el-table-column label="公告标题" min-width="300">
          <template #default="{ row }">
            <a v-if="row.link" :href="row.link" target="_blank" rel="noopener">
              {{ row.title || row.customer }}
            </a>
            <span v-else>{{ row.title || row.customer }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="scale" label="规模" width="120" />
        <el-table-column prop="amount" label="金额" width="130" />
        <el-table-column prop="type" label="类型" width="140" />
        <el-table-column label="中标厂商" width="200">
          <template #default="{ row }">
            <template v-if="row.vendors && row.vendors.length">
              <el-tag
                v-for="v in row.vendors"
                :key="v"
                size="small"
                style="margin-right: 4px"
              >{{ v }}</el-tag>
            </template>
            <span v-else class="muted small">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="150">
          <template #default="{ row }">
            <span class="muted small">{{ sourceLabel(row.source) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="panel">
      <div class="head">
        <h2 class="section-title" style="margin: 0">客户细分 · 需求洞察</h2>
        <span class="muted small" v-if="data">
          按客户类型 · 更新于 {{ data.updatedAt }}
        </span>
      </div>

      <div class="segment-grid">
        <div
          v-for="s in data?.segments || []"
          :key="s.id"
          class="segment"
          :class="`prio-${s.priority}`"
        >
          <div class="seg-head">
            <div style="flex: 1">
              <div class="seg-name">
                {{ s.name }}
                <el-tag
                  v-if="s.priority === 'high'"
                  type="danger"
                  size="small"
                  effect="dark"
                >优先</el-tag>
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
            <div class="block-title">💰 资本开支 (Capex) 与 AI 占比 · 主要服务器供应商</div>
            <el-table :data="s.capex" size="small" stripe>
              <el-table-column prop="company" label="公司" width="150" />
              <el-table-column prop="period" label="周期" width="140" />
              <el-table-column prop="amount" label="金额" width="130" />
              <el-table-column prop="aiShare" label="AI 占比" width="100">
                <template #default="{ row }">
                  <el-tag type="warning" size="small">{{ row.aiShare }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="服务器供应商" min-width="220">
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

          <!-- 运营商 / 金融 已披露集采 -->
          <div class="sub-block" v-if="s.recentDeals && s.recentDeals.length">
            <div class="block-title">📋 近期已披露采购 · 中标厂商 &amp; 份额</div>
            <el-table :data="s.recentDeals" size="small" stripe>
              <el-table-column prop="customer" label="采购人" width="120" />
              <el-table-column prop="title" label="公告标题" min-width="220" />
              <el-table-column prop="scale" label="规模" width="110" />
              <el-table-column prop="amount" label="金额" width="120" />
              <el-table-column label="中标厂商 · 份额 / 数量" min-width="300">
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

          <!-- 政府 AI 采购与政策补贴 -->
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

          <div class="sub-block" v-if="s.govAiProcurement && s.govAiProcurement.length">
            <div class="block-title">🧾 政府 AI 服务器已披露采购 · 中标厂商</div>
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

    <!-- 小 B / 个人洞察重点 -->
    <div class="panel highlight" v-if="data?.smbAndConsumerInsights">
      <h3 style="margin-top: 0">
        <span class="badge">重点</span>
        小 B &amp; 个人趋势洞察
      </h3>
      <p class="muted small">
        个人 / 小 B 是当前增速最高的两个细分，值得重点跟踪
      </p>
      <div class="insight-grid">
        <div
          v-for="(ins, i) in data.smbAndConsumerInsights"
          :key="i"
          class="insight-card"
        >
          <div class="insight-title">{{ ins.title }}</div>
          <div class="muted small" style="line-height: 1.7">
            {{ ins.detail }}
          </div>
          <div v-if="ins.source" class="src-tag">来源：{{ ins.source }}</div>
        </div>
      </div>
    </div>

    <!-- 个人用户 · 使用 AI 场景 & 硬件分层 -->
    <PersonaGrid
      v-if="data?.consumerPersonas"
      :group="data.consumerPersonas"
      accent="consumer"
    />

    <!-- 小 B 用户 · 使用 AI 场景 & 硬件分层 -->
    <PersonaGrid
      v-if="data?.smbPersonas"
      :group="data.smbPersonas"
      accent="smb"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { fetchCustomerSegments, fetchCustomerOrders } from '@/api'
import PersonaGrid from '@/components/PersonaGrid.vue'

const data = ref(null)
const deals = ref([])
const dealFilter = ref('')

const SOURCE_MAP = {
  ccgp: '中国政府采购网',
  'ccgp-zygg-zbgg': '中国政府采购网',
  'seed-manual': '手工录入 · 公开新闻',
  'cmcc-b2b': '中国移动',
  'unicom-bidding': '中国联通',
  'demo-placeholder': '示例数据',
}
function sourceLabel(s) { return SOURCE_MAP[s] || s || '—' }

function statusType(s) {
  if (!s) return 'info'
  if (s.includes('交付') || s.includes('中标')) return 'success'
  if (s.includes('开标')) return 'warning'
  return 'primary'
}

async function loadDeals() {
  deals.value = await fetchCustomerOrders({ customer: dealFilter.value })
}

onMounted(async () => {
  data.value = await fetchCustomerSegments()
  loadDeals()
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

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
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

  &.prio-high {
    border-left: 3px solid #dc2626;
  }
}

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

.sub-block {
  margin-top: 14px;
}

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
  letter-spacing: 0.5px;
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

@media (max-width: 960px) {
  .seg-body { grid-template-columns: 1fr; }
}
</style>
