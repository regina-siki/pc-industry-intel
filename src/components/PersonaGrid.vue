<!--
  用户 / 小 B 分层洞察卡片组
  props:
    group: {
      title, researchSource, dataAsOf,
      personas: [{ tier, name, share, budget, scenarios[], productBought[], painPoints[], demands[], source }]
    }
    accent: 'consumer' | 'smb'（决定配色）
-->
<template>
  <div class="panel persona-panel" :class="`accent-${accent}`" v-if="group">
    <div class="panel-head">
      <div>
        <h2 class="section-title" style="margin: 0">
          <span class="badge" :class="`badge-${accent}`">
            {{ accent === 'consumer' ? '个人层' : '小 B 层' }}
          </span>
          {{ group.title }}
        </h2>
        <p class="muted small" style="margin: 4px 0 0">
          调研来源：{{ group.researchSource }} · 更新于 {{ group.dataAsOf }}
        </p>
      </div>
    </div>

    <!-- 分层份额条 -->
    <div class="tier-bar">
      <div
        v-for="p in group.personas"
        :key="p.tier"
        class="tier-slot"
        :style="{ width: (p.share || 0) + '%' }"
        :class="{ active: activeTier === p.tier }"
        @click="activeTier = activeTier === p.tier ? '' : p.tier"
      >
        <div class="tier-slot-label">
          {{ p.tier.split(' · ')[0] }}
        </div>
        <div class="tier-slot-share">{{ p.share }}%</div>
      </div>
    </div>

    <!-- 每层详情卡 -->
    <div class="persona-grid">
      <div
        v-for="p in group.personas"
        :key="p.tier"
        class="persona-card"
        :class="{ dimmed: activeTier && activeTier !== p.tier }"
      >
        <div class="pc-head">
          <div>
            <div class="pc-tier">{{ p.tier }}</div>
            <div class="pc-name">{{ p.name }}</div>
          </div>
          <div class="pc-meta">
            <div class="pc-share">{{ p.share }}%</div>
            <div class="pc-budget muted small">预算 {{ p.budget }}</div>
          </div>
        </div>

        <div class="pc-section">
          <div class="pc-title">使用场景</div>
          <ul>
            <li v-for="s in p.scenarios" :key="s">{{ s }}</li>
          </ul>
        </div>

        <div class="pc-section">
          <div class="pc-title">已购产品</div>
          <ul>
            <li v-for="s in p.productBought" :key="s">{{ s }}</li>
          </ul>
        </div>

        <div class="pc-section">
          <div class="pc-title pain">核心痛点</div>
          <ul class="pain-list">
            <li v-for="s in p.painPoints" :key="s">{{ s }}</li>
          </ul>
        </div>

        <div class="pc-section">
          <div class="pc-title demand">核心诉求</div>
          <ul class="demand-list">
            <li v-for="s in p.demands" :key="s">{{ s }}</li>
          </ul>
        </div>

        <div class="pc-section" v-if="p.regions">
          <div class="pc-title region">集中地域</div>
          <div class="chip-list">
            <el-tag
              v-for="r in p.regions"
              :key="r"
              size="small"
              type="warning"
              effect="plain"
            >{{ r }}</el-tag>
          </div>
        </div>

        <div class="pc-section" v-if="p.awareChannels">
          <div class="pc-title chan-know">了解 AI 的渠道</div>
          <div class="chip-list">
            <el-tag
              v-for="r in p.awareChannels"
              :key="r"
              size="small"
              type="primary"
              effect="plain"
            >{{ r }}</el-tag>
          </div>
        </div>

        <div class="pc-section" v-if="p.purchaseChannels">
          <div class="pc-title chan-buy">采购 AI 硬件的渠道</div>
          <div class="chip-list">
            <el-tag
              v-for="r in p.purchaseChannels"
              :key="r"
              size="small"
              type="success"
              effect="plain"
            >{{ r }}</el-tag>
          </div>
        </div>

        <div class="src-tag" v-if="p.source">来源：{{ p.source }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  group: { type: Object, required: true },
  accent: { type: String, default: 'consumer' },
})

const activeTier = ref('')
</script>

<style scoped lang="scss">
.persona-panel {
  margin-top: 16px;

  &.accent-consumer {
    background: linear-gradient(135deg, #fff 0%, #fdf4ff 100%);
    border: 1px solid #f0abfc;
  }
  &.accent-smb {
    background: linear-gradient(135deg, #fff 0%, #eff6ff 100%);
    border: 1px solid #93c5fd;
  }
}

.panel-head {
  margin-bottom: 12px;
}

.badge {
  display: inline-block;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  vertical-align: 3px;
}

.badge-consumer { background: #c026d3; }
.badge-smb { background: #2563eb; }

.small { font-size: 12px; }

.tier-bar {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.02);
}

.tier-slot {
  min-width: 60px;
  padding: 8px 10px;
  border-right: 2px solid #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  text-align: center;
  transition: opacity 0.2s;

  .accent-consumer & { background: linear-gradient(135deg, #c026d3, #a21caf); }
  .accent-smb & { background: linear-gradient(135deg, #2563eb, #1d4ed8); }

  &:hover { opacity: 0.85; }
  &.active { box-shadow: inset 0 0 0 3px #fbbf24; }
  &:last-child { border-right: none; }
}

.tier-slot-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tier-slot-share {
  font-size: 13px;
  font-weight: 700;
  opacity: 0.9;
}

.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

.persona-card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  transition: opacity 0.25s;

  .accent-consumer & { border-left: 3px solid #c026d3; }
  .accent-smb & { border-left: 3px solid #2563eb; }

  &.dimmed { opacity: 0.3; }
}

.pc-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px dashed var(--c-border);
}

.pc-tier {
  font-size: 12px;
  color: var(--c-muted);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.pc-name {
  font-weight: 600;
  font-size: 15px;
  margin-top: 4px;
}

.pc-meta { text-align: right; }

.pc-share {
  font-size: 20px;
  font-weight: 700;

  .accent-consumer & { color: #c026d3; }
  .accent-smb & { color: #2563eb; }
}

.pc-section {
  margin-bottom: 10px;
}

.pc-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-muted);
  margin-bottom: 4px;

  &.pain { color: #dc2626; }
  &.demand { color: #16a34a; }
  &.region { color: #b45309; }
  &.chan-know { color: #2563eb; }
  &.chan-buy { color: #059669; }
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
}

.persona-card ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.75;
  font-size: 13px;

  li { margin-bottom: 2px; }
}

.pain-list li { color: #7f1d1d; }
.demand-list li { color: #15803d; }

.src-tag {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  background: rgba(47, 84, 235, 0.06);
  border-radius: 4px;
  font-size: 11px;
  color: var(--c-primary);
}
</style>
