<template>
  <div class="app-layout">
    <a class="skip-link" href="#main-content">跳到正文</a>

    <header class="app-header">
      <div class="container header-inner">
        <router-link to="/" class="logo" aria-label="PCInsight 首页">
          <span class="logo-mark" aria-hidden="true">PI</span>
          <span class="logo-copy">
            <span class="logo-text">PCInsight</span>
            <span class="logo-sub">硬件产业情报</span>
          </span>
        </router-link>

        <nav class="nav" aria-label="主导航">
          <router-link
            v-for="(item, index) in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ appendix: item.appendix }"
            active-class="active"
          >
            <span class="nav-index">0{{ index + 1 }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="search" role="search">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索情报"
            aria-label="搜索情报"
            @keyup.enter="onSearch"
          />
          <span class="search-key">↵</span>
        </div>
      </div>
    </header>

    <main id="main-content" class="app-main">
      <div class="container">
        <div class="page-masthead">
          <div>
            <div class="page-kicker">{{ pageInfo.kicker }}</div>
            <h1>{{ pageInfo.title }}</h1>
          </div>
          <p>{{ pageInfo.description }}</p>
        </div>
        <slot />
      </div>
    </main>

    <footer class="app-footer">
      <div class="container footer-inner">
        <div class="footer-brand">PCInsight <span>/</span> Research Desk</div>
        <div>© {{ year }} · 数据仅供行业研究与经营判断参考</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const year = new Date().getFullYear()

const navItems = [
  { path: '/', label: '产业链' },
  { path: '/product', label: '产品周期' },
  { path: '/customer', label: '运营策略' },
  { path: '/wechat', label: '公众号档案', appendix: true },
]

const pageMap = {
  'supply-chain': {
    kicker: 'Supply chain monitor',
    title: '上下游供应链',
    description: '追踪供需变化、价格波动与政策信号，辅助备货、调价和供应商谈判。',
  },
  product: {
    kicker: 'Product lifecycle',
    title: '产品与换代周期',
    description: '比较新老产品、价格区间和生命周期位置，找到更合适的经营窗口。',
  },
  customer: {
    kicker: 'Go-to-market strategy',
    title: '客户与渠道策略',
    description: '把客户画像、采购动机与产品服务方案放在同一张经营地图中。',
  },
  wechat: {
    kicker: 'Source archive',
    title: '公众号追踪档案',
    description: '维护行业信源，持续补充产业链、产品和渠道侧的一手信息。',
  },
  'news-detail': {
    kicker: 'Source reading',
    title: '资讯原文',
    description: '查看摘要、正文与来源信息。',
  },
}

const pageInfo = computed(() => pageMap[route.name] || pageMap['supply-chain'])

function onSearch() {
  const q = keyword.value.trim()
  if (!q) return
  router.push({ path: '/', query: { q } })
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

.skip-link {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;
  padding: 9px 14px;
  color: #fff;
  background: var(--c-text);
  transform: translateY(-160%);
  transition: transform 180ms ease;

  &:focus { transform: translateY(0); }
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid color-mix(in srgb, var(--c-text) 14%, transparent);
  background: color-mix(in srgb, var(--c-bg) 90%, transparent);
  backdrop-filter: blur(18px) saturate(130%);
}

.header-inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  min-height: 76px;
  gap: 30px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--c-text);
}

.logo-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--c-text);
  border-radius: 3px 11px 3px 3px;
  color: var(--c-text);
  background: var(--c-surface-strong);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.08em;
  box-shadow: 4px 4px 0 var(--c-accent-soft);
}

.logo-copy { display: grid; line-height: 1; }
.logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.035em;
}
.logo-sub {
  margin-top: 6px;
  color: var(--c-muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
}

.nav {
  display: flex;
  justify-content: center;
  min-width: 0;
  gap: 4px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 11px 13px 10px;
  border-radius: 5px;
  color: var(--c-muted);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: color 180ms ease, background-color 180ms ease;

  &::after {
    position: absolute;
    right: 13px;
    bottom: 5px;
    left: 13px;
    height: 1px;
    background: var(--c-accent);
    content: '';
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 220ms cubic-bezier(.2,.8,.2,1);
  }

  &:hover { color: var(--c-text); background: rgba(255, 255, 255, 0.45); }
  &.active { color: var(--c-text); }
  &.active::after { transform: scaleX(1); }
}

.nav-index {
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
}

.search {
  display: flex;
  width: 194px;
  height: 38px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--c-border-strong);
  border-radius: 6px;
  background: rgba(255,255,255,.5);
  transition: border-color 180ms ease, box-shadow 180ms ease;

  &:focus-within {
    border-color: var(--c-accent);
    box-shadow: 0 0 0 3px var(--c-accent-soft);
  }

  input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    color: var(--c-text);
    background: transparent;
    font: inherit;
    font-size: 12px;

    &::placeholder { color: var(--c-muted-light); }
    &::-webkit-search-cancel-button { display: none; }
  }
}

.search-icon {
  width: 15px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--c-muted);
  stroke-linecap: round;
  stroke-width: 1.7;
}
.search-key {
  color: var(--c-muted-light);
  font-family: var(--font-mono);
  font-size: 11px;
}

.app-main {
  flex: 1;
  padding: 42px 0 72px;
}

.page-masthead {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 440px);
  align-items: end;
  gap: 72px;
  margin-bottom: 28px;
  padding: 6px 4px 28px;
  border-bottom: 1px solid var(--c-border-strong);

  h1 {
    margin: 4px 0 0;
    font-family: var(--font-display);
    font-size: clamp(32px, 4.1vw, 52px);
    font-weight: 700;
    letter-spacing: -0.06em;
    line-height: 1.05;
    text-wrap: balance;
  }

  p {
    max-width: 34rem;
    margin: 0;
    color: var(--c-muted);
    font-size: 13px;
    line-height: 1.8;
    text-wrap: pretty;
  }
}

.page-kicker {
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.app-footer {
  padding: 26px 0 32px;
  border-top: 1px solid var(--c-border-strong);
  color: var(--c-muted);
  background: rgba(237, 232, 221, 0.55);
  font-size: 11px;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.footer-brand {
  color: var(--c-text);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;

  span { margin: 0 6px; color: var(--c-accent); }
}

@media (max-width: 1080px) {
  .header-inner { gap: 16px; }
  .logo-sub { display: none; }
  .nav-item { padding-inline: 9px; }
  .search { width: 154px; }
}

@media (max-width: 820px) {
  .header-inner {
    grid-template-columns: auto 1fr;
    min-height: auto;
    padding-top: 12px;
  }
  .search { width: 100%; justify-self: end; }
  .nav {
    grid-column: 1 / -1;
    justify-content: flex-start;
    padding: 2px 0 10px;
    overflow-x: auto;
  }
  .nav-item:first-child { padding-left: 0; }
  .page-masthead { grid-template-columns: 1fr; gap: 13px; }
}

@media (max-width: 560px) {
  .header-inner { grid-template-columns: 1fr; }
  .search { grid-row: 2; }
  .nav { grid-row: 3; }
  .app-main { padding-top: 28px; }
  .page-masthead h1 { font-size: 34px; }
  .footer-inner { align-items: flex-start; flex-direction: column; }
}
</style>
