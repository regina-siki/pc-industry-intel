<!--
  Sparkline —— 无坐标轴的迷你走势线，适合放表格里
  props:
    values: number[]
    labels: string[]  (可选，用于 tooltip)
    trend: 'up' | 'down' | 'flat'
    height: 32
-->
<template>
  <div class="sparkline" @mouseleave="hover = -1">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :width="width" :height="height"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 面积 -->
      <path
        :d="areaPath"
        :fill="color"
        opacity="0.15"
      />
      <!-- 折线 -->
      <path
        :d="linePath"
        fill="none"
        :stroke="color"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- 交互点 -->
      <g v-for="(v, i) in values" :key="i">
        <circle
          :cx="x(i)"
          :cy="y(v)"
          r="6"
          fill="transparent"
          @mouseenter="hover = i"
        />
        <circle
          v-if="hover === i"
          :cx="x(i)"
          :cy="y(v)"
          r="3"
          :fill="color"
          stroke="#fff"
          stroke-width="1.5"
        />
      </g>
    </svg>
    <div class="last-value" :class="`t-${trend}`">
      {{ lastValue }}<span class="unit">{{ trendArrow }}</span>
    </div>
    <div v-if="hover >= 0" class="sp-tooltip" :style="tooltipStyle">
      <div v-if="labels && labels[hover]" class="sp-t-label">{{ labels[hover] }}</div>
      <div class="sp-t-val">{{ values[hover] }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  values: { type: Array, required: true },
  labels: { type: Array, default: () => [] },
  trend: { type: String, default: 'flat' },
  width: { type: Number, default: 120 },
  height: { type: Number, default: 32 },
})

const hover = ref(-1)

const color = computed(
  () => ({ up: '#dc2626', down: '#16a34a', flat: '#64748b' }[props.trend] || '#64748b'),
)

const min = computed(() => Math.min(...props.values))
const max = computed(() => Math.max(...props.values))
const range = computed(() => Math.max(1, max.value - min.value))

const x = (i) => (props.width - 4) * (i / Math.max(1, props.values.length - 1)) + 2
const y = (v) => props.height - 4 - ((v - min.value) / range.value) * (props.height - 8)

const linePath = computed(() =>
  props.values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' '),
)
const areaPath = computed(() => {
  const line = props.values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ')
  return `${line} L ${x(props.values.length - 1).toFixed(1)} ${props.height} L ${x(0).toFixed(1)} ${props.height} Z`
})

const lastValue = computed(() => props.values[props.values.length - 1])
const trendArrow = computed(
  () => ({ up: ' ↑', down: ' ↓', flat: ' →' }[props.trend] || ''),
)

const tooltipStyle = computed(() => {
  if (hover.value < 0) return {}
  return {
    left: `${x(hover.value)}px`,
    top: `-2px`,
  }
})
</script>

<style scoped lang="scss">
.sparkline {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

svg {
  overflow: visible;
}

.last-value {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &.t-up { color: #dc2626; }
  &.t-down { color: #16a34a; }
  &.t-flat { color: #64748b; }
}

.unit { font-size: 11px; }

.sp-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 3px 6px;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  border-radius: 3px;
  font-size: 11px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
}

.sp-t-label {
  opacity: 0.7;
  font-size: 10px;
}

.sp-t-val {
  font-weight: 700;
}
</style>
