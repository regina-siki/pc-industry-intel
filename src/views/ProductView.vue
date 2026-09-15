<template>
  <div>
    <div class="panel notice" v-if="data?.disclaimer">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ data.disclaimer }}</span>
    </div>

    <div class="panel">
      <div class="head">
        <div>
          <h2 class="section-title" style="margin: 0">
            🧩 产品 · 生命周期与新老品对比
          </h2>
          <p class="muted small" style="margin: 4px 0 0">
            按品类切换 · 每款产品含发布/爬坡/主流/清尾/停产阶段 · 与老款对比升级点 · 更新于 {{ data?.updatedAt }}
          </p>
        </div>
        <el-radio-group v-model="activeCategory" size="default">
          <el-radio-button
            v-for="c in data?.categories || []"
            :key="c.id"
            :label="c.id"
          >
            {{ c.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="phase-legend" v-if="data?.phaseLegend">
        <span class="muted small" style="margin-right: 8px">生命周期阶段：</span>
        <el-tag
          v-for="(desc, key) in data.phaseLegend"
          :key="key"
          :type="phaseType(key)"
          size="small"
          style="margin-right: 6px"
          :title="desc"
        >
          {{ key }}
        </el-tag>
      </div>
    </div>

    <div class="panel category-panel" v-if="activeCat">
      <div class="cat-note muted small" v-if="activeCat.note">
        💡 {{ activeCat.note }}
      </div>

      <div class="prod-grid">
        <div
          v-for="(p, i) in activeCat.products"
          :key="i"
          class="prod-card"
        >
          <div class="prod-head">
            <div class="prod-name-wrap">
              <div class="prod-name">{{ p.name }}</div>
              <div class="muted small">{{ p.vendor }} · 发布 {{ p.released }}</div>
            </div>
            <el-tag :type="phaseType(p.phase)" effect="dark" class="prod-phase">
              {{ p.phase }}
            </el-tag>
          </div>

          <div class="prod-price">
            <div>
              <span class="muted small">首发 ASP</span>
              <div class="price-value old">{{ p.priceAtLaunch }}</div>
            </div>
            <div class="price-arrow">→</div>
            <div>
              <span class="muted small">当前 ASP</span>
              <div class="price-value new">{{ p.currentPrice }}</div>
            </div>
            <div class="cadence-tag" v-if="p.cadence">
              🔄 换代节奏 <b>{{ p.cadence }}</b>
            </div>
          </div>

          <div class="prod-block spec" v-if="p.specHighlights?.length">
            <div class="block-title">🔎 关键规格</div>
            <ul>
              <li v-for="s in p.specHighlights" :key="s">{{ s }}</li>
            </ul>
          </div>

          <div class="prod-block versus" v-if="p.vsOldGen">
            <div class="block-title">🆚 新 vs 老</div>
            <div class="vs-row">
              <div class="vs-side old-side">
                <div class="vs-label">老款</div>
                <div class="vs-name">{{ p.vsOldGen.name }}</div>
                <div class="vs-price">{{ p.vsOldGen.asp }}</div>
              </div>
              <div class="vs-gap">
                <div class="vs-arrow">→</div>
                <div class="muted small vs-hint">{{ p.vsOldGen.keyGap }}</div>
              </div>
              <div class="vs-side new-side">
                <div class="vs-label">新款</div>
                <div class="vs-name">{{ p.name }}</div>
                <div class="vs-price">{{ p.currentPrice }}</div>
              </div>
            </div>
          </div>

          <div class="prod-block nextgen" v-if="p.nextGen">
            <div class="block-title">🔮 下一代</div>
            <div>{{ p.nextGen }}</div>
          </div>

          <div class="prod-block jd" v-if="p.jdAction">
            <div class="block-title">📦 京东建议动作</div>
            <div>{{ p.jdAction }}</div>
          </div>

          <div class="src-tag">来源：{{ p.source }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchProductLifecycle } from '@/api'
import { InfoFilled } from '@element-plus/icons-vue'
import { useBus } from '@/stores/bus'

const bus = useBus()
const data = ref(null)
const activeCategory = ref('desktop')

const activeCat = computed(
  () => data.value?.categories?.find((c) => c.id === activeCategory.value)
)

function phaseType(p) {
  switch (p) {
    case '发布': return 'primary'
    case '爬坡': return 'success'
    case '主流': return ''
    case '清尾': return 'warning'
    case '停产': return 'danger'
    default: return 'info'
  }
}

async function reload() {
  data.value = await fetchProductLifecycle()
  // 若默认 activeCategory 不在数据中，选第一个
  if (data.value?.categories?.length && !data.value.categories.some(c => c.id === activeCategory.value)) {
    activeCategory.value = data.value.categories[0].id
  }
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
  background: rgba(47, 84, 235, 0.04);
  border: 1px solid rgba(47, 84, 235, 0.15);
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--c-muted);
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.section-title { font-size: 18px; font-weight: 600; }

.phase-legend {
  padding: 8px 12px;
  background: #fafaf9;
  border-radius: 6px;
  font-size: 12px;
}

.small { font-size: 12px; }

.category-panel { margin-top: 12px; }

.cat-note {
  padding: 8px 12px;
  margin-bottom: 12px;
  background: rgba(37, 99, 235, 0.06);
  border-left: 3px solid #2563eb;
  border-radius: 4px;
  line-height: 1.7;
}

.prod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 14px;
}

.prod-card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  border-top: 3px solid #2563eb;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-sm); }
}

.prod-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px dashed var(--c-border);
}

.prod-name-wrap { flex: 1; min-width: 0; }
.prod-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--c-text);
  margin-bottom: 2px;
}

.prod-phase { flex-shrink: 0; }

.prod-price {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fafaf9 0%, #f0f5ff 100%);
  border-radius: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.price-value {
  font-weight: 700;
  font-size: 16px;
}
.price-value.old { color: #94a3b8; }
.price-value.new { color: #16a34a; }

.price-arrow {
  font-size: 16px;
  color: var(--c-muted);
}

.cadence-tag {
  margin-left: auto;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--c-muted);
}

.prod-block {
  padding: 8px 10px;
  margin-bottom: 8px;
  background: #fafaf9;
  border-radius: 5px;
  font-size: 12.5px;
  line-height: 1.7;

  ul {
    margin: 3px 0 0;
    padding-left: 18px;
  }
  li { margin-bottom: 2px; }
}

.prod-block.spec { background: rgba(47, 84, 235, 0.04); }
.prod-block.versus { background: rgba(22, 163, 74, 0.05); }
.prod-block.nextgen { background: rgba(245, 158, 11, 0.08); }
.prod-block.jd { background: rgba(220, 38, 38, 0.05); }

.block-title {
  font-weight: 600;
  font-size: 12.5px;
  margin-bottom: 4px;
  color: var(--c-text);
}

.vs-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
}

.vs-side {
  padding: 6px 8px;
  background: #fff;
  border-radius: 4px;
  text-align: center;
}

.old-side { border: 1px solid #cbd5e1; }
.new-side { border: 1px solid #86efac; }

.vs-label {
  font-size: 11px;
  color: var(--c-muted);
  margin-bottom: 2px;
}

.vs-name {
  font-weight: 600;
  font-size: 12.5px;
  line-height: 1.4;
  margin-bottom: 2px;
}

.vs-price {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.new-side .vs-price { color: #15803d; }

.vs-gap { text-align: center; }
.vs-arrow {
  font-size: 18px;
  color: #16a34a;
  margin-bottom: 4px;
}
.vs-hint {
  font-size: 11px;
  line-height: 1.5;
  max-width: 150px;
}

.src-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 3px 10px;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 4px;
  font-size: 11px;
  color: var(--c-primary);
}

@media (max-width: 720px) {
  .vs-row { grid-template-columns: 1fr; }
  .vs-gap { display: none; }
}
</style>
