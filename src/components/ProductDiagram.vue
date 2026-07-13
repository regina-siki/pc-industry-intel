<!--
  产品结构示意图（SVG）—— 具象化展示各部件位置 + 成本占比 + 联动高亮
  props:
    productId: 'dgx-b200' | 'amd-395-ws'
    components: [{ part, share, cost }, ...]
    activePart: string | ''  // 外部传入的高亮部件（与饼图/滑块联动）
  emits:
    hover: (partName | '') 鼠标悬停哪个部件
-->
<template>
  <div class="diagram-wrap">
    <div class="diagram-title muted small">
      🔍 产品结构示意 · 悬停查看各部件成本
    </div>

    <!-- DGX B200 服务器机箱示意 -->
    <svg
      v-if="productId === 'dgx-b200'"
      class="diagram"
      viewBox="0 0 600 340"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 定义可复用样式 -->
      <defs>
        <linearGradient id="grad-gpu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="100%" stop-color="#16a34a" />
        </linearGradient>
        <linearGradient id="grad-cpu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
        <linearGradient id="grad-mem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#9333ea" />
        </linearGradient>
      </defs>

      <!-- 机箱外壳 -->
      <rect x="20" y="30" width="560" height="280" rx="10"
        fill="#1f2937" stroke="#0f172a" stroke-width="2" />
      <text x="30" y="52" fill="#94a3b8" font-size="12" font-weight="600">
        NVIDIA DGX B200 · 8U 机箱
      </text>

      <!-- 8 张 GPU（横排 4 组，每组 2 张）—— 62% 成本主体 -->
      <g class="part" data-part="GPU (B200 × 8)"
         @mouseenter="onHover('GPU (B200 × 8)')" @mouseleave="onHover('')">
        <g v-for="i in 8" :key="`gpu-${i}`">
          <rect
            :x="45 + ((i - 1) % 4) * 130"
            :y="70 + Math.floor((i - 1) / 4) * 60"
            width="115" height="48" rx="6"
            fill="url(#grad-gpu)"
            :stroke="isActive('GPU (B200 × 8)') ? '#fbbf24' : '#065f46'"
            :stroke-width="isActive('GPU (B200 × 8)') ? 3 : 1"
            class="part-shape"
          />
          <text
            :x="45 + ((i - 1) % 4) * 130 + 57"
            :y="70 + Math.floor((i - 1) / 4) * 60 + 30"
            text-anchor="middle" fill="#fff" font-size="12" font-weight="700"
          >B200</text>
          <!-- HBM 芯片小格 -->
          <rect
            :x="45 + ((i - 1) % 4) * 130 + 6"
            :y="70 + Math.floor((i - 1) / 4) * 60 + 6"
            width="18" height="8" rx="2" fill="#fef3c7"
          />
          <rect
            :x="45 + ((i - 1) % 4) * 130 + 91"
            :y="70 + Math.floor((i - 1) / 4) * 60 + 6"
            width="18" height="8" rx="2" fill="#fef3c7"
          />
        </g>
        <text x="300" y="192" text-anchor="middle" fill="#4ade80" font-size="11" font-weight="700">
          GPU × 8（含 HBM3e） · 占 BOM ≈ 62%
        </text>
      </g>

      <!-- 双路 CPU -->
      <g class="part" data-part="CPU (Intel/AMD 双路)"
         @mouseenter="onHover('CPU (Intel/AMD 双路)')" @mouseleave="onHover('')">
        <rect x="45" y="210" width="90" height="40" rx="4"
          fill="url(#grad-cpu)"
          :stroke="isActive('CPU (Intel/AMD 双路)') ? '#fbbf24' : '#1e40af'"
          :stroke-width="isActive('CPU (Intel/AMD 双路)') ? 3 : 1"
          class="part-shape"
        />
        <text x="90" y="235" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">CPU 0</text>
        <rect x="145" y="210" width="90" height="40" rx="4"
          fill="url(#grad-cpu)"
          :stroke="isActive('CPU (Intel/AMD 双路)') ? '#fbbf24' : '#1e40af'"
          :stroke-width="isActive('CPU (Intel/AMD 双路)') ? 3 : 1"
          class="part-shape"
        />
        <text x="190" y="235" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">CPU 1</text>
        <text x="140" y="265" text-anchor="middle" fill="#60a5fa" font-size="10">CPU 双路 · 4%</text>
      </g>

      <!-- DDR5 内存条 (10 根) -->
      <g class="part" data-part="DDR5 内存"
         @mouseenter="onHover('DDR5 内存')" @mouseleave="onHover('')">
        <rect v-for="i in 10" :key="`ddr-${i}`"
          :x="250 + (i - 1) * 12"
          y="210" width="9" height="40" rx="1"
          :fill="isActive('DDR5 内存') ? '#fbbf24' : '#9333ea'"
          class="part-shape"
        />
        <text x="304" y="265" text-anchor="middle" fill="#c084fc" font-size="10">
          DDR5 × 10 · 3%
        </text>
      </g>

      <!-- 存储 NVMe SSD -->
      <g class="part" data-part="NVMe SSD"
         @mouseenter="onHover('NVMe SSD')" @mouseleave="onHover('')">
        <rect x="385" y="210" width="60" height="18" rx="2"
          :fill="isActive('NVMe SSD') ? '#fbbf24' : '#0891b2'"
          class="part-shape"
        />
        <rect x="385" y="232" width="60" height="18" rx="2"
          :fill="isActive('NVMe SSD') ? '#fbbf24' : '#0891b2'"
          class="part-shape"
        />
        <text x="415" y="265" text-anchor="middle" fill="#22d3ee" font-size="10">
          NVMe SSD · 2%
        </text>
      </g>

      <!-- 网络 (NVLink / IB) -->
      <g class="part" data-part="网络 (NVLink/InfiniBand)"
         @mouseenter="onHover('网络 (NVLink/InfiniBand)')" @mouseleave="onHover('')">
        <rect x="455" y="210" width="55" height="40" rx="3"
          :fill="isActive('网络 (NVLink/InfiniBand)') ? '#fbbf24' : '#f472b6'"
          class="part-shape"
        />
        <text x="482" y="235" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">NVLink</text>
        <text x="482" y="265" text-anchor="middle" fill="#f472b6" font-size="10">网络 · 5%</text>
      </g>

      <!-- 电源 / 散热（后侧） -->
      <g class="part" data-part="电源 / 散热"
         @mouseenter="onHover('电源 / 散热')" @mouseleave="onHover('')">
        <rect x="520" y="70" width="45" height="180" rx="4"
          :fill="isActive('电源 / 散热') ? '#fbbf24' : '#f97316'"
          :opacity="isActive('电源 / 散热') ? 1 : 0.9"
          class="part-shape"
        />
        <!-- 风扇纹理 -->
        <circle cx="542" cy="110" r="14" fill="none" stroke="#fed7aa" stroke-width="2" class="fan" />
        <circle cx="542" cy="160" r="14" fill="none" stroke="#fed7aa" stroke-width="2" class="fan" />
        <circle cx="542" cy="210" r="14" fill="none" stroke="#fed7aa" stroke-width="2" class="fan" />
        <text x="542" y="265" text-anchor="middle" fill="#f97316" font-size="10">电源+散热 · 3%</text>
      </g>

      <!-- 底部：PCB 主板 & 其他 -->
      <g class="part" data-part="机箱 / PCB / 连接器"
         @mouseenter="onHover('机箱 / PCB / 连接器')" @mouseleave="onHover('')">
        <rect x="30" y="280" width="490" height="20" rx="3"
          :fill="isActive('机箱 / PCB / 连接器') ? '#fbbf24' : '#0f766e'"
          class="part-shape"
        />
        <text x="275" y="295" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">
          PCB 主板 / 连接器 · 2%
        </text>
      </g>

      <!-- 数据流动画 —— GPU 之间的 NVLink -->
      <g class="dataflow">
        <line x1="102" y1="94" x2="558" y2="94" stroke="#4ade80" stroke-width="1"
          stroke-dasharray="4,4" opacity="0.6" class="flow-line" />
        <line x1="102" y1="154" x2="558" y2="154" stroke="#4ade80" stroke-width="1"
          stroke-dasharray="4,4" opacity="0.6" class="flow-line" />
      </g>
    </svg>

    <!-- 工作站示意 -->
    <svg
      v-else-if="productId === 'amd-395-ws'"
      class="diagram"
      viewBox="0 0 600 340"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad-soc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f87171" />
          <stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
        <linearGradient id="grad-lpddr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>

      <!-- 机箱外壳（桌面小机箱） -->
      <rect x="80" y="40" width="440" height="270" rx="12"
        fill="#1f2937" stroke="#0f172a" stroke-width="2" />
      <text x="90" y="62" fill="#94a3b8" font-size="12" font-weight="600">
        AMD Ryzen AI Max+ 395 工作站
      </text>

      <!-- SoC 中心大方块 -->
      <g class="part" data-part="SoC (Ryzen AI Max+ 395)"
         @mouseenter="onHover('SoC (Ryzen AI Max+ 395)')" @mouseleave="onHover('')">
        <rect x="220" y="120" width="160" height="120" rx="10"
          fill="url(#grad-soc)"
          :stroke="isActive('SoC (Ryzen AI Max+ 395)') ? '#fbbf24' : '#7f1d1d'"
          :stroke-width="isActive('SoC (Ryzen AI Max+ 395)') ? 4 : 1"
          class="part-shape"
        />
        <text x="300" y="160" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">
          Ryzen AI
        </text>
        <text x="300" y="180" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">
          Max+ 395
        </text>
        <text x="300" y="205" text-anchor="middle" fill="#fef3c7" font-size="10">
          16C CPU · 8060S iGPU
        </text>
        <text x="300" y="222" text-anchor="middle" fill="#fef3c7" font-size="10">
          NPU 50 TOPS
        </text>
        <text x="300" y="258" text-anchor="middle" fill="#f87171" font-size="11" font-weight="700">
          SoC · 45%
        </text>
      </g>

      <!-- LPDDR5X 内存（板载，围绕 SoC 8 颗） -->
      <g class="part" data-part="LPDDR5X 128GB (统一内存)"
         @mouseenter="onHover('LPDDR5X 128GB (统一内存)')" @mouseleave="onHover('')">
        <!-- 左侧 4 颗 -->
        <rect v-for="i in 4" :key="`lp-l-${i}`"
          :x="170" :y="120 + (i - 1) * 30"
          width="40" height="20" rx="2"
          :fill="isActive('LPDDR5X 128GB (统一内存)') ? '#fbbf24' : '#7c3aed'"
          class="part-shape"
        />
        <!-- 右侧 4 颗 -->
        <rect v-for="i in 4" :key="`lp-r-${i}`"
          :x="390" :y="120 + (i - 1) * 30"
          width="40" height="20" rx="2"
          :fill="isActive('LPDDR5X 128GB (统一内存)') ? '#fbbf24' : '#7c3aed'"
          class="part-shape"
        />
        <text x="190" y="252" text-anchor="middle" fill="#c084fc" font-size="10">128GB</text>
        <text x="410" y="252" text-anchor="middle" fill="#c084fc" font-size="10">LPDDR5X · 22%</text>
      </g>

      <!-- NVMe SSD（M.2 长条） -->
      <g class="part" data-part="NVMe SSD (2TB)"
         @mouseenter="onHover('NVMe SSD (2TB)')" @mouseleave="onHover('')">
        <rect x="100" y="80" width="120" height="14" rx="2"
          :fill="isActive('NVMe SSD (2TB)') ? '#fbbf24' : '#0891b2'"
          class="part-shape"
        />
        <text x="160" y="76" text-anchor="middle" fill="#22d3ee" font-size="10">M.2 SSD 2TB · 8%</text>
      </g>

      <!-- 主板底板 -->
      <g class="part" data-part="主板 / VRM"
         @mouseenter="onHover('主板 / VRM')" @mouseleave="onHover('')">
        <rect x="90" y="270" width="420" height="30" rx="4"
          :fill="isActive('主板 / VRM') ? '#fbbf24' : '#0f766e'"
          class="part-shape"
        />
        <text x="300" y="290" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">
          主板 + VRM · 8%
        </text>
      </g>

      <!-- 散热风扇（顶部） -->
      <g class="part" data-part="散热 / 风扇"
         @mouseenter="onHover('散热 / 风扇')" @mouseleave="onHover('')">
        <circle cx="440" cy="90" r="18"
          :fill="isActive('散热 / 风扇') ? '#fbbf24' : '#f97316'"
          class="part-shape fan"
        />
        <text x="440" y="76" text-anchor="middle" fill="#f97316" font-size="9">散热 · 5%</text>
        <text x="440" y="95" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">✚</text>
      </g>

      <!-- 电源 -->
      <g class="part" data-part="电源"
         @mouseenter="onHover('电源')" @mouseleave="onHover('')">
        <rect x="90" y="250" width="80" height="16" rx="2"
          :fill="isActive('电源') ? '#fbbf24' : '#ea580c'"
          class="part-shape"
        />
        <text x="130" y="262" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">
          PSU · 4%
        </text>
      </g>

      <!-- 其他 (WiFi/IO) -->
      <g class="part" data-part="其他 (Wi-Fi / IO)"
         @mouseenter="onHover('其他 (Wi-Fi / IO)')" @mouseleave="onHover('')">
        <rect x="440" y="250" width="70" height="16" rx="2"
          :fill="isActive('其他 (Wi-Fi / IO)') ? '#fbbf24' : '#64748b'"
          class="part-shape"
        />
        <text x="475" y="262" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">
          IO · 4%
        </text>
      </g>
    </svg>

    <!-- 悬停时的详情浮层 -->
    <transition name="fade">
      <div v-if="hoveredInfo" class="hover-info">
        <div class="hi-name">{{ hoveredInfo.part }}</div>
        <div class="hi-line">
          占比 <b>{{ (hoveredInfo.share * 100).toFixed(0) }}%</b> ·
          成本 <b>${{ formatNum(hoveredInfo.cost) }}</b>
        </div>
        <div class="hi-vendor muted small" v-if="hoveredInfo.vendors">
          主要供应商：{{ hoveredInfo.vendors.join(' · ') }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  productId: { type: String, required: true },
  components: { type: Array, default: () => [] },
  activePart: { type: String, default: '' },
})
const emit = defineEmits(['hover'])

const internalHover = ref('')
const currentActive = computed(() => props.activePart || internalHover.value)

const hoveredInfo = computed(() => {
  if (!currentActive.value) return null
  return props.components.find((c) => c.part === currentActive.value) || null
})

function isActive(name) { return currentActive.value === name }
function onHover(name) {
  internalHover.value = name
  emit('hover', name)
}
function formatNum(n) { return Math.round(n).toLocaleString('en-US') }

// 产品切换后清空内部 hover
watch(() => props.productId, () => { internalHover.value = '' })
</script>

<style scoped lang="scss">
.diagram-wrap {
  position: relative;
  padding: 8px 0;
}

.diagram-title {
  margin-bottom: 6px;
}

.diagram {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

/* 部件 hover 动效 */
:deep(.part) {
  cursor: pointer;
}
:deep(.part-shape) {
  transition: transform 0.2s ease, filter 0.2s ease;
  transform-origin: center;
  transform-box: fill-box;
}
:deep(.part:hover .part-shape) {
  filter: brightness(1.2) drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));
  transform: scale(1.05);
}

/* 风扇旋转动画 */
:deep(.fan) {
  transform-origin: center;
  transform-box: fill-box;
  animation: spin 4s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 数据流动画 —— GPU 间 NVLink */
:deep(.flow-line) {
  animation: flow 2s linear infinite;
}
@keyframes flow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -16; }
}

/* 悬停浮层 */
.hover-info {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  border-radius: 6px;
  min-width: 180px;
  z-index: 2;
  pointer-events: none;
}

.hi-name {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
  color: #fbbf24;
}

.hi-line {
  font-size: 12px;
  line-height: 1.6;
}

.hi-vendor {
  margin-top: 4px;
  font-size: 11px;
  color: #cbd5e1 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
