<template>
  <article class="news-card" @click="goDetail">
    <div class="meta">
      <span class="tag" v-for="t in news.tags" :key="t">{{ t }}</span>
      <span class="muted">{{ news.publishedAt }} · {{ news.source }}</span>
    </div>
    <h3 class="title">{{ news.title }}</h3>
    <p class="summary muted">{{ news.summary }}</p>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  news: { type: Object, required: true },
})

const router = useRouter()
function goDetail() {
  router.push({ name: 'news-detail', params: { id: props.news.id } })
}
</script>

<style scoped lang="scss">
.news-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  & + & {
    margin-top: 12px;
  }

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 8px;
}

.tag {
  background: rgba(47, 84, 235, 0.08);
  color: var(--c-primary);
  padding: 2px 8px;
  border-radius: 4px;
}

.title {
  margin: 0 0 6px;
  font-size: 16px;
  line-height: 1.4;
}

.summary {
  margin: 0;
  line-height: 1.6;
  font-size: 13px;
}
</style>
