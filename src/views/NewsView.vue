<template>
  <div>
    <!-- 顶部：动态摘要（由最新资讯自动汇总，含产品动态 + 三层链路影响） -->
    <div class="panel summary-panel" v-if="chainImpact">
      <div class="head">
        <div>
          <h2 class="section-title" style="margin: 0">
            <span class="badge-live">动态</span>
            近 {{ chainImpact.windowDays }} 天资讯 · 对产业链的影响
          </h2>
          <span class="muted small">
            数据源：全部为已入库资讯自动聚合 · 更新于 {{ chainImpact.generatedAt }} · 共 {{ chainImpact.totalArticles }} 条
          </span>
        </div>
        <div>
          <el-radio-group v-model="chainImpactDays" size="small">
            <el-radio-button :label="3">近 3 天</el-radio-button>
            <el-radio-button :label="7">近 7 天</el-radio-button>
            <el-radio-button :label="14">近 14 天</el-radio-button>
            <el-radio-button :label="30">近 30 天</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-col" v-if="chainImpact.productBullets?.length">
          <div class="col-title">
            <span class="col-icon">📦</span>
            产品整体动态（跨链条 5 条）
          </div>
          <ul>
            <li
              v-for="b in chainImpact.productBullets"
              :key="b.id"
            >
              <router-link :to="`/news/${b.id}`" class="bullet-link">
                <span class="bullet-tag">[{{ b.layerName }}]</span>
                {{ b.title }}
              </router-link>
              <span class="muted small bullet-meta">· {{ b.source }} · {{ b.publishedAt }}</span>
            </li>
          </ul>
        </div>

        <div
          class="summary-col"
          v-for="s in chainImpact.summaryBullets"
          :key="s.layerId"
        >
          <div class="col-title">
            <span class="col-icon">{{ layerIcon(s.layerName) }}</span>
            {{ s.layerName }}
            <el-tag
              :type="trendType(s.trend)"
              size="small"
              effect="dark"
              style="margin-left: 6px"
            >
              {{ trendIcon(s.trend) }} {{ s.count }} 条
            </el-tag>
          </div>
          <ul v-if="s.bullets?.length">
            <li v-for="b in s.bullets" :key="b.id">
              <router-link :to="`/news/${b.id}`" class="bullet-link">
                <span class="bullet-tag">[{{ b.subName }}]</span>
                {{ b.title }}
              </router-link>
              <span class="muted small bullet-meta">· {{ b.source }} · {{ b.publishedAt }}</span>
            </li>
          </ul>
          <div v-else class="muted small" style="padding: 6px 0">
            该窗口暂无相关资讯
          </div>
        </div>
      </div>
    </div>

    <!-- 资讯对供应链的影响（可视化 · 每层子分类分布 + 代表新闻） -->
    <div class="panel chain-impact" v-if="chainImpact">
      <div class="chain-impact-head">
        <div>
          <h3 class="section-title" style="margin: 0">
            <span class="badge-impact">📊 影响分析</span>
            近 {{ chainImpact.windowDays }} 天资讯对上中下游的分布
          </h3>
          <p class="muted small" style="margin: 4px 0 0">
            每层左上角是资讯条数 + 环比标签；下方是子分类热度 + 代表新闻
          </p>
        </div>
      </div>

      <div class="chain-layer-grid">
        <div
          v-for="l in chainImpact.layers"
          :key="l.id"
          class="chain-layer-card"
          :class="`layer-${l.id}`"
          @click="scrollToLayer(l.id)"
        >
          <div class="chain-layer-head">
            <div class="chain-layer-name">{{ l.name }}</div>
            <div class="chain-layer-metrics">
              <span class="chain-count">{{ l.count }} 条</span>
              <el-tag
                :type="trendType(l.trend)"
                size="small"
                effect="dark"
                class="chain-trend"
              >
                {{ trendIcon(l.trend) }} {{ l.deltaLabel }}
              </el-tag>
            </div>
          </div>

          <div v-if="l.count === 0" class="chain-empty muted small">
            该窗口暂无相关资讯
          </div>

          <template v-else>
            <div class="chain-sub-tags" v-if="l.subCategories?.length">
              <el-tag
                v-for="sub in l.subCategories"
                :key="sub.key"
                size="small"
                type="info"
                effect="plain"
              >
                {{ sub.name }} · {{ sub.count }}
              </el-tag>
            </div>

            <div class="chain-articles">
              <div class="chain-articles-title muted small">🔥 代表性新闻</div>
              <router-link
                v-for="a in l.articles"
                :key="a.id"
                :to="`/news/${a.id}`"
                class="chain-article-row"
                @click.stop
              >
                <span class="chain-article-date muted small">{{ a.publishedAt }}</span>
                <span class="chain-article-title">{{ a.title }}</span>
                <span class="chain-article-source muted small">{{ a.source }}</span>
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 每一层的资讯（按子分类展开） -->
    <div
      v-for="layer in visibleLayers"
      :key="layer.id"
      :id="`layer-${layer.id}`"
      class="panel layer-panel"
    >
      <div class="layer-head">
        <div>
          <h3 style="margin: 0">{{ layer.name }}</h3>
          <span class="muted small">{{ layer.total }} 条</span>
        </div>
      </div>

      <div v-if="!layer.total" class="muted small" style="padding: 20px 0">
        暂无该层动态
      </div>

      <div
        v-for="sub in layer.subCategories.filter((s) => s.articles.length)"
        :key="sub.key"
        class="sub-block"
      >
        <div class="sub-title">
          <span class="sub-name">{{ sub.name }}</span>
          <span class="muted small">{{ sub.articles.length }} 条</span>
        </div>
        <NewsCard v-for="n in sub.articles.slice(0, 5)" :key="n.id" :news="n" />
        <router-link
          v-if="sub.articles.length > 5"
          :to="{ path: '/news', query: { layer: layer.id } }"
          class="more-link"
        >
          查看该子类全部 {{ sub.articles.length }} 条 →
        </router-link>
      </div>
    </div>

    <!-- 传统列表（搜索/翻页） -->
    <div class="panel">
      <div class="head" style="margin-bottom: 12px">
        <h3 style="margin: 0">全量资讯（搜索 / 翻页）</h3>
      </div>
      <div class="filter">
        <el-input
          v-model="query"
          placeholder="按关键词搜索"
          clearable
          style="width: 240px"
          @keyup.enter="reload"
          @clear="reload"
        />
        <el-select
          v-model="layerFilter"
          placeholder="按产业链层筛选"
          clearable
          style="width: 180px"
          @change="reload"
        >
          <el-option label="上游" value="upstream" />
          <el-option label="中游" value="mid" />
          <el-option label="下游" value="downstream" />
          <el-option label="综合" value="other" />
        </el-select>
        <el-button type="primary" @click="reload">搜索</el-button>
      </div>

      <el-empty v-if="!loading && !flatList.length" description="暂无匹配资讯" />
      <NewsCard v-for="n in flatList" :key="n.id" :news="n" />

      <div class="pager" v-if="total > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="page"
          @current-change="reload"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { fetchNews, fetchNewsStructured, fetchNewsChainImpact } from '@/api'
import { useBus } from '@/stores/bus'
import NewsCard from '@/components/NewsCard.vue'

const route = useRoute()
const bus = useBus()

const chainImpact = ref(null)
const chainImpactDays = ref(7)
const structured = ref(null)
const visibleLayers = computed(() => structured.value?.layers || [])

const flatList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const query = ref('')
const layerFilter = ref('')
const loading = ref(false)

async function reload() {
  loading.value = true
  const res = await fetchNews({
    page: page.value,
    pageSize,
    q: query.value,
    layer: layerFilter.value,
  })
  flatList.value = res.list
  total.value = res.total
  loading.value = false
}

async function reloadStructured() {
  structured.value = await fetchNewsStructured({ days: 30 })
}

async function reloadChainImpact() {
  try {
    chainImpact.value = await fetchNewsChainImpact(chainImpactDays.value)
  } catch {
    /* silent */
  }
}

function scrollToLayer(id) {
  nextTick(() => {
    document.getElementById(`layer-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

function layerIcon(l) {
  if (l.startsWith('上游')) return '🔧'
  if (l.startsWith('中游')) return '🏭'
  if (l.startsWith('下游')) return '🏢'
  return '·'
}
function trendType(t) {
  if (t === 'up') return 'danger'
  if (t === 'down') return 'success'
  return 'info'
}
function trendIcon(t) {
  if (t === 'up') return '📈'
  if (t === 'down') return '📉'
  return '⏸'
}

watch(
  () => route.query.q,
  (q) => {
    if (q) { query.value = String(q); page.value = 1; reload() }
  },
)

watch(chainImpactDays, () => reloadChainImpact())

onMounted(async () => {
  if (route.query.q) query.value = String(route.query.q)
  if (route.query.layer) layerFilter.value = String(route.query.layer)
  reloadChainImpact()
  reloadStructured()
  reload()
})

// 公众号入库后自动刷新分类聚合 + 全量列表 + 动态摘要
watch(
  () => bus.ingestVersion,
  () => {
    reloadChainImpact()
    reloadStructured()
    page.value = 1
    reload()
  },
)
</script>

<style scoped lang="scss">
.summary-panel {
  background: linear-gradient(135deg, #fff 0%, #f0f5ff 100%);
  margin-bottom: 16px;
}

.badge-live {
  display: inline-block;
  background: #16a34a;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  vertical-align: 3px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.summary-col {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 14px 16px;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.col-icon { font-size: 18px; }

.summary-col ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
  font-size: 13px;
}

.summary-col li {
  margin-bottom: 6px;
  line-height: 1.6;
}

.bullet-link {
  color: var(--c-text);
  text-decoration: none;

  &:hover {
    color: var(--c-primary);
    text-decoration: underline;
  }
}

.bullet-tag {
  display: inline-block;
  padding: 1px 6px;
  margin-right: 4px;
  background: rgba(47, 84, 235, 0.08);
  color: var(--c-primary);
  font-size: 11px;
  border-radius: 3px;
  font-weight: 600;
}

.bullet-meta { margin-left: 4px; }

.chain-impact {
  background: linear-gradient(135deg, #fff 0%, #f0fdfa 100%);
  border: 1px solid #99f6e4;
  margin-bottom: 16px;
}

.badge-impact {
  display: inline-block;
  background: #0d9488;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 600;
}

.chain-impact-head { margin-bottom: 12px; }

.chain-layer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.chain-layer-card {
  padding: 12px 14px;
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--c-border);
  border-top: 3px solid #0d9488;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  &.layer-upstream { border-top-color: #2563eb; }
  &.layer-mid { border-top-color: #f59e0b; }
  &.layer-downstream { border-top-color: #16a34a; }
}

.chain-layer-head {
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--c-border);
}

.chain-layer-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.layer-upstream .chain-layer-name { color: #1d4ed8; }
.layer-mid .chain-layer-name { color: #b45309; }
.layer-downstream .chain-layer-name { color: #15803d; }

.chain-layer-metrics {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chain-count {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.chain-empty {
  padding: 12px;
  text-align: center;
  font-style: italic;
}

.chain-sub-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.chain-articles-title {
  margin: 6px 0 4px;
  font-weight: 600;
}

.chain-article-row {
  display: grid;
  grid-template-columns: 82px 1fr auto;
  align-items: baseline;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: inherit;
  transition: background 0.12s;

  &:hover {
    background: rgba(13, 148, 136, 0.05);
    text-decoration: none;
  }

  &:last-child { border-bottom: none; }
}

.chain-article-date {
  flex-shrink: 0;
  font-family: 'SF Mono', Menlo, monospace;
}

.chain-article-title {
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-text);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chain-article-source {
  flex-shrink: 0;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.small { font-size: 12px; }

.layer-panel {
  margin-bottom: 16px;
}

.layer-head {
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 2px solid var(--c-border);
}

.sub-block {
  margin-bottom: 20px;
}

.sub-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.sub-name {
  font-weight: 600;
  color: var(--c-primary);
  padding-left: 8px;
  border-left: 3px solid var(--c-primary);
}

.more-link {
  display: inline-block;
  margin-top: 6px;
  font-size: 13px;
}

.filter {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pager {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 960px) {
  .chain-layer-grid { grid-template-columns: 1fr; }
}
</style>
