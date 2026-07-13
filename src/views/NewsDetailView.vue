<template>
  <div v-if="news">
    <div class="panel">
      <div class="back">
        <el-button text @click="$router.back()">← 返回资讯</el-button>
      </div>
      <h1 class="title">{{ news.title }}</h1>
      <div class="meta">
        <span class="meta-item">📅 {{ news.publishedAt }}</span>
        <span class="meta-item">📰 {{ news.source }}</span>
        <span class="meta-item" v-if="news.author">✍️ {{ news.author }}</span>
        <span v-for="t in news.tags" :key="t" class="tag">{{ t }}</span>
      </div>

      <!-- 一句话摘要 -->
      <div class="lead" v-if="news.summary">
        {{ news.summary }}
      </div>

      <!-- 正文 —— 有则显示，无则给出提示 -->
      <div class="article" v-if="hasContent">
        <div
          v-if="isHtml"
          class="article-html"
          v-html="sanitizedContent"
        />
        <div v-else class="article-text">
          <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
        </div>
      </div>

      <div class="no-content muted" v-else>
        <el-icon><InfoFilled /></el-icon>
        本条资讯没有正文入库（RSS 源仅提供摘要）。
      </div>

      <!-- 原文外链 -->
      <div class="footer">
        <a
          v-if="news.link"
          :href="news.link"
          target="_blank"
          rel="noopener"
          class="external"
        >
          阅读原文 ↗
        </a>
      </div>
    </div>
  </div>
  <el-empty v-else description="资讯不存在" />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { InfoFilled } from '@element-plus/icons-vue'
import { fetchNewsById } from '@/api'

const route = useRoute()
const news = ref(null)

const hasContent = computed(
  () => !!(news.value?.content && news.value.content.trim().length > 20),
)

// 判断是 HTML 还是纯文本（RSS 抓取器留了 HTML，公众号抓到的是文本）
const isHtml = computed(() => /<[a-z][\s\S]*>/i.test(news.value?.content || ''))

// 极简 sanitize：去脚本/style/事件属性/危险 href
const sanitizedContent = computed(() => {
  if (!news.value?.content) return ''
  return news.value.content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
})

// 纯文本按段落切分
const paragraphs = computed(() => {
  if (!news.value?.content) return []
  return news.value.content
    .split(/\n{2,}|(?:。|！|？)(?=\s|$)/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    // 短句合并（避免每一句都成为一段）
    .reduce((acc, s) => {
      const last = acc[acc.length - 1]
      if (last && (last.length + s.length) < 120) {
        acc[acc.length - 1] = last + '。' + s
      } else {
        acc.push(s)
      }
      return acc
    }, [])
})

onMounted(async () => {
  news.value = await fetchNewsById(route.params.id)
})
</script>

<style scoped lang="scss">
.back { margin-bottom: 12px; }

.title {
  margin: 0 0 12px;
  font-size: 24px;
  line-height: 1.4;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--c-bg);
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--c-muted);
}

.meta-item { font-weight: 500; }

.tag {
  background: rgba(47, 84, 235, 0.08);
  color: var(--c-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.lead {
  padding: 14px 16px;
  background: rgba(47, 84, 235, 0.05);
  border-left: 3px solid var(--c-primary);
  border-radius: 6px;
  margin-bottom: 20px;
  line-height: 1.7;
  font-size: 15px;
  color: var(--c-text);
}

.article {
  padding: 0 4px;
  line-height: 1.85;
  font-size: 15px;
  color: var(--c-text);
}

.article-html {
  :deep(p) {
    margin: 0 0 14px;
  }
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 20px 0 10px;
    line-height: 1.4;
  }
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 12px 0;
  }
  :deep(a) {
    color: var(--c-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  :deep(blockquote) {
    margin: 12px 0;
    padding: 8px 14px;
    border-left: 3px solid var(--c-border);
    color: var(--c-muted);
    background: var(--c-bg);
    border-radius: 4px;
  }
  :deep(ul),
  :deep(ol) {
    padding-left: 24px;
    margin: 0 0 14px;
  }
  :deep(li) {
    margin-bottom: 4px;
  }
  :deep(pre),
  :deep(code) {
    background: var(--c-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
  }
  :deep(pre) {
    padding: 12px 14px;
    overflow-x: auto;
    line-height: 1.6;
  }
  :deep(table) {
    border-collapse: collapse;
    margin: 12px 0;
  }
  :deep(th),
  :deep(td) {
    border: 1px solid var(--c-border);
    padding: 6px 10px;
  }
}

.article-text p {
  margin: 0 0 12px;
}

.no-content {
  padding: 20px;
  border: 1px dashed var(--c-border);
  border-radius: var(--radius);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed var(--c-border);
  text-align: right;
}

.external {
  display: inline-block;
  padding: 8px 16px;
  background: var(--c-primary);
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }
}
</style>
