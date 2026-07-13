<template>
  <div class="chain">
    <div class="chain-col" v-for="col in columns" :key="col.key">
      <div class="chain-col-title">{{ col.title }}</div>
      <div
        v-for="node in col.nodes"
        :key="node.id"
        class="chain-node"
        :class="{ active: activeId === node.id }"
        @mouseenter="activeId = node.id"
        @mouseleave="activeId = ''"
      >
        <div class="node-name">{{ node.name }}</div>
        <div class="node-companies muted">
          {{ (companies[node.id] || []).slice(0, 4).join(' · ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const activeId = ref('')

const companies = computed(() => props.data.companies || {})

const columns = computed(() => {
  const group = (layer) =>
    (props.data.nodes || []).filter((n) => n.layer === layer)
  return [
    { key: 'upstream', title: '上游 · 元器件 / 物料', nodes: group('upstream') },
    { key: 'mid', title: '中游 · 整机制造', nodes: group('mid') },
    { key: 'downstream', title: '下游 · 终端客户', nodes: group('downstream') },
  ]
})
</script>

<style scoped lang="scss">
.chain {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chain-col-title {
  font-weight: 600;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--c-primary);
}

.chain-node {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 10px;
  transition: all 0.2s;
  cursor: default;

  &:hover,
  &.active {
    border-color: var(--c-primary);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
}

.node-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.node-companies {
  font-size: 12px;
  line-height: 1.5;
}
</style>
