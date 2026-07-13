<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="container header-inner">
        <router-link to="/" class="logo">
          <span class="logo-mark">SI</span>
          <span class="logo-text">ServerInsight</span>
        </router-link>
        <nav class="nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ appendix: item.appendix }"
            active-class="active"
          >
            {{ item.label }}
          </router-link>
        </nav>
        <div class="search">
          <el-input
            v-model="keyword"
            placeholder="搜索"
            clearable
            size="small"
            style="width: 180px"
            @keyup.enter="onSearch"
          />
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <slot />
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <span class="muted">
          © {{ year }} ServerInsight · 数据仅供参考，不构成投资建议
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const year = new Date().getFullYear()

const navItems = [
  { path: '/', label: '首页' },
  { path: '/news', label: '资讯' },
  { path: '/product', label: '产品' },
  { path: '/cost', label: '成本·BOM' },
  { path: '/segments', label: '客户细分' },
  { path: '/match', label: '用户匹配' },
  { path: '/supply-chain', label: '产业链' },
  { path: '/companies', label: '公司库' },
  { path: '/wechat', label: '附录·公众号', appendix: true },
]

function onSearch() {
  if (!keyword.value.trim()) return
  router.push({ path: '/news', query: { q: keyword.value.trim() } })
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: var(--c-text);
}

.logo-mark {
  width: 28px;
  height: 28px;
  background: var(--c-primary);
  color: #fff;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
}

.nav-item {
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--c-text);
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;

  &:hover {
    background: var(--c-bg);
  }

  &.active {
    color: var(--c-primary);
    background: rgba(47, 84, 235, 0.08);
  }

  &.appendix {
    margin-left: auto;
    color: var(--c-muted);
    border: 1px dashed var(--c-border);

    &.active {
      color: var(--c-primary);
      border-color: var(--c-primary);
      background: rgba(47, 84, 235, 0.06);
    }
  }
}

.app-main {
  flex: 1;
  padding: 24px 0 48px;
}

.app-footer {
  border-top: 1px solid var(--c-border);
  padding: 16px 0;
  background: #fff;
  text-align: center;
}
</style>
