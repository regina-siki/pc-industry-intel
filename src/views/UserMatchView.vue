<template>
  <div>
    <div class="panel intro">
      <div>
        <h2 class="section-title" style="margin: 0">
          <span class="badge">匹配</span>
          个人 &amp; 小 B 用户 · 产品 / 价格 / 服务 匹配矩阵
        </h2>
        <p class="muted small" style="margin: 4px 0 0">
          {{ data?.note }}
        </p>
      </div>
      <div class="filter" v-if="data">
        <el-radio-group v-model="kindFilter" size="default">
          <el-radio-button label="">全部 ({{ data.matches.length }})</el-radio-button>
          <el-radio-button label="consumer">个人 ({{ consumerCount }})</el-radio-button>
          <el-radio-button label="smb">小 B ({{ smbCount }})</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="match-list" v-if="data">
      <div
        v-for="m in filteredMatches"
        :key="m.personaTier"
        class="match-card"
        :class="`kind-${m.kind}`"
      >
        <!-- 头 -->
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

        <!-- 6 列匹配 -->
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

        <!-- 尾 -->
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchUserMatch } from '@/api'

const data = ref(null)
const kindFilter = ref('')

const filteredMatches = computed(() => {
  const list = data.value?.matches || []
  return kindFilter.value ? list.filter((m) => m.kind === kindFilter.value) : list
})
const consumerCount = computed(
  () => (data.value?.matches || []).filter((m) => m.kind === 'consumer').length,
)
const smbCount = computed(
  () => (data.value?.matches || []).filter((m) => m.kind === 'smb').length,
)

onMounted(async () => {
  data.value = await fetchUserMatch()
})
</script>

<style scoped lang="scss">
.intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  flex-wrap: wrap;
}

.badge {
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

.match-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.match-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 16px 18px;
  transition: box-shadow 0.2s;

  &.kind-consumer { border-left: 4px solid #c026d3; }
  &.kind-smb { border-left: 4px solid #2563eb; }

  &:hover { box-shadow: var(--shadow-sm); }
}

.mc-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--c-border);
}

.mc-avatar {
  font-size: 40px;
  line-height: 1;
}

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

  &.motive { border-top-color: #f59e0b; }
  &.product { border-top-color: #2563eb; }
  &.price { border-top-color: #16a34a; }
  &.pain { border-top-color: #dc2626; }
  &.demand { border-top-color: #14b8a6; }
  &.service { border-top-color: #7c3aed; }
}

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

  li { margin-bottom: 2px; }
}

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

@media (max-width: 1200px) {
  .mc-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 720px) {
  .mc-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
