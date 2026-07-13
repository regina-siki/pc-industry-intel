<template>
  <div>
    <!-- 数据源说明卡 —— 因未接入真实数据源，暂不展示销量/ASP 图表 -->
    <div class="panel disclaimer">
      <div class="disc-title">
        <el-icon><InfoFilled /></el-icon>
        <b>关于本页数据</b>
      </div>
      <p style="margin: 8px 0 12px">
        {{ data?.disclaimer || '未接入真实数据源前，出货量与 ASP 相关图表不展示。' }}
      </p>
      <details>
        <summary class="muted small" style="cursor: pointer">
          真实数据可从以下渠道获取（点击展开）
        </summary>
        <div class="src-grid">
          <div>
            <div class="block-title">📊 出货量数据</div>
            <ul class="src-list">
              <li
                v-for="s in data?.dataSourceGuide?.shipment || []"
                :key="s.name"
              >
                <b>{{ s.name }}</b>
                <el-tag :type="typeOfSource(s.type)" size="small">{{ s.type }}</el-tag>
                <span class="muted small">· {{ s.cost }}｜{{ s.note }}</span>
              </li>
            </ul>
          </div>
          <div>
            <div class="block-title">💰 ASP / 价格数据</div>
            <ul class="src-list">
              <li
                v-for="s in data?.dataSourceGuide?.asp || []"
                :key="s.name"
              >
                <b>{{ s.name }}</b>
                <el-tag :type="typeOfSource(s.type)" size="small">{{ s.type }}</el-tag>
                <span class="muted small">· {{ s.cost }}｜{{ s.note }}</span>
              </li>
            </ul>
          </div>
        </div>
      </details>
    </div>

    <div class="grid">
      <!-- 技术迭代时间线 -->
      <div class="panel">
        <h3 style="margin-top: 0">近期技术迭代</h3>
        <p class="muted small" style="margin-top: -4px">
          来源均可在公开新闻中交叉验证
        </p>
        <el-timeline>
          <el-timeline-item
            v-for="(it, i) in data?.techIterations || []"
            :key="i"
            :timestamp="it.date"
            :type="levelType(it.level)"
            placement="top"
          >
            <div class="tl-title">{{ it.title }}</div>
            <div class="muted small">{{ it.impact }}</div>
            <div v-if="it.source" class="src-tag">
              来源：{{ it.source }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 趋势判断 -->
      <div class="panel">
        <h3 style="margin-top: 0">趋势与方向</h3>
        <div
          v-for="(t, i) in data?.trends || []"
          :key="i"
          class="trend-card"
          :class="`dir-${t.direction}`"
        >
          <div class="trend-head">
            <span class="arrow">{{ arrow(t.direction) }}</span>
            <span class="trend-title">{{ t.title }}</span>
          </div>
          <div class="muted small">{{ t.detail }}</div>
          <div v-if="t.source" class="src-tag">来源：{{ t.source }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { fetchProduct } from '@/api'

const data = ref(null)

function levelType(l) {
  return { high: 'danger', mid: 'warning', low: 'info' }[l] || 'primary'
}
function arrow(d) {
  return { up: '↑', down: '↓', flat: '→' }[d] || '·'
}
function typeOfSource(t) {
  if (t === '免费') return 'success'
  if (t === '半免费') return 'warning'
  return 'info'
}

onMounted(async () => {
  data.value = await fetchProduct()
})
</script>

<style scoped lang="scss">
.disclaimer {
  background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
  border: 1px dashed #fbbf24;
  margin-bottom: 16px;
}

.disc-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b45309;
}

.small { font-size: 12px; }

.src-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}

.block-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--c-text);
}

.src-list {
  margin: 0;
  padding-left: 16px;
  line-height: 2;
  font-size: 13px;

  li { margin-bottom: 4px; }

  .el-tag {
    margin: 0 6px;
    vertical-align: 2px;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.tl-title { font-weight: 600; margin-bottom: 4px; }

.src-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 4px;
  font-size: 11px;
  color: var(--c-primary);
}

.trend-card {
  padding: 12px 14px;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 3px solid var(--c-primary);
  background: #fafafa;

  &.dir-up { border-left-color: #16a34a; background: #f0fdf4; }
  &.dir-down { border-left-color: #dc2626; background: #fef2f2; }
  &.dir-flat { border-left-color: #f59e0b; background: #fffbeb; }
}

.trend-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-weight: 600;
}

.arrow {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 960px) {
  .grid { grid-template-columns: 1fr; }
  .src-grid { grid-template-columns: 1fr; }
}
</style>
