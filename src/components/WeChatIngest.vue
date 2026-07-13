<template>
  <div class="panel wechat-ingest">
    <div class="head">
      <h3 class="title">
        <span class="badge">公众号</span>
        粘贴文章链接入库
      </h3>
      <a
        class="muted small"
        href="https://weixin.sogou.com/"
        target="_blank"
        rel="noopener"
      >
        找文章 · 微信搜一搜 ↗
      </a>
    </div>
    <el-input
      v-model="text"
      type="textarea"
      :rows="3"
      resize="vertical"
      placeholder="每行粘贴一个 https://mp.weixin.qq.com/s/xxx 链接（支持批量）"
    />
    <div class="actions">
      <span class="muted small">
        {{ urlCount }} 个有效链接 · 自动抓取标题/正文，规则式生成摘要
      </span>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!urlCount"
        @click="submit"
      >
        抓取入库
      </el-button>
    </div>

    <div v-if="lastResult" class="result">
      <div class="result-line">
        <b>共提交 {{ lastResult.total }} 篇</b> ·
        入库 {{ lastResult.inserted }} 篇
        <template v-if="lastResult.newAccounts > 0">
          · <span class="hl-green">
            新收录公众号 {{ lastResult.newAccounts }} 个
          </span>
        </template>
        <template v-if="lastResult.touchedAccounts > 0">
          · 已在库 {{ lastResult.touchedAccounts }} 个
        </template>
      </div>
      <ul class="result-detail">
        <li
          v-for="(r, i) in lastResult.results"
          :key="i"
          :class="{ ok: r.ok && r.inserted, warn: !r.ok || !r.inserted }"
        >
          <template v-if="r.ok && r.inserted">
            ✓ <b>{{ r.account || '公众号' }}</b>
            <el-tag
              v-if="r.accountAdded"
              type="success"
              size="small"
              effect="dark"
              style="margin: 0 6px"
            >新收录</el-tag>
            <el-tag
              v-else
              size="small"
              style="margin: 0 6px"
            >已在库</el-tag>
            · {{ r.title }}
            <el-tag
              v-if="r.classification"
              type="info"
              size="small"
              style="margin-left: 4px"
            >
              {{ r.classification.subName }}
            </el-tag>
          </template>
          <template v-else-if="r.ok && !r.inserted">
            ↻ 已存在（重复链接）· {{ r.title || r.url }}
          </template>
          <template v-else-if="r.skipped">
            ⊘ 跳过 · {{ r.skipped }} · {{ r.url }}
          </template>
          <template v-else>
            ✗ 失败 · {{ r.error }} · {{ r.url }}
          </template>
        </li>
      </ul>
      <div class="post-hint muted small" v-if="lastResult.inserted">
        📡 网站内所有相关模块（资讯、产业链分类、公众号清单、首页统计）已自动刷新
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ingestWeChatUrls } from '@/api'
import { bumpIngestVersion } from '@/stores/bus'

const emit = defineEmits(['ingested'])

const text = ref('')
const loading = ref(false)
const lastResult = ref(null)

const urls = computed(() =>
  text.value
    .split(/[\n\r,\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^https:\/\/mp\.weixin\.qq\.com\/s\//.test(s)),
)
const urlCount = computed(() => urls.value.length)

async function submit() {
  if (!urlCount.value) return
  loading.value = true
  try {
    lastResult.value = await ingestWeChatUrls(urls.value)
    const msg = `入库 ${lastResult.value.inserted} 篇` +
      (lastResult.value.newAccounts ? ` · 新收录公众号 ${lastResult.value.newAccounts} 个` : '')
    ElMessage.success(msg)
    text.value = ''

    // 触发全站数据自动刷新
    if (lastResult.value.inserted > 0 || lastResult.value.newAccounts > 0) {
      bumpIngestVersion(lastResult.value)
    }
    emit('ingested', lastResult.value)
  } catch (e) {
    ElMessage.error(e?.message || '抓取失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.wechat-ingest {
  background: linear-gradient(135deg, #fff 0%, #f0f9f5 100%);
  border: 1px dashed rgba(19, 194, 194, 0.4);
  margin-bottom: 16px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.title {
  margin: 0;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: #13c2c2;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.small {
  font-size: 12px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.result {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  font-size: 13px;
}

.result-line {
  margin-bottom: 6px;
}

.result-detail {
  margin: 0;
  padding-left: 18px;
  color: var(--c-muted);
  line-height: 1.7;

  li.ok { color: #16a34a; }
  li.warn { color: #dc2626; }
}

.hl-green { color: #16a34a; font-weight: 600; }

.post-hint {
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(19, 194, 194, 0.08);
  border-radius: 4px;
  color: #0891b2;
}
</style>
