# ServerInsight Backend

轻量后端：Express + JSON 文件存储 + node-cron 定时抓取。
面向 MVP 阶段，无需数据库和编译工具链即可运行；数据量大后可无缝换成 SQLite / Postgres。

## 运行

```bash
cd server
npm install
npm run fetch      # 立刻拉一次 RSS，写入 data/news.db.json
npm start          # 起 API 服务，默认 http://localhost:8787
npm run dev        # 起服务并热重载
```

## 数据抓取

- 定时任务：`.env` 中的 `FETCH_CRON`（默认每小时 5 分抓一次）
- 手动触发：`GET /api/fetch/rss`、`GET /api/fetch/tenders`
- 一次性执行：`npm run fetch`

## 增/减 RSS 源

编辑 [src/fetchers/rss-sources.js](src/fetchers/rss-sources.js) 的 `rssSources`。
同文件的 `keywordFilters` 用于关键词过滤，命中任一才入库。

## 接入招标 / 公告站点

`src/fetchers/tenders.js` 是骨架，按站点在 `sites/` 下写单站适配器：

```js
// server/src/fetchers/sites/mobile-cmcc.js
export default {
  name: 'cmcc-eb',
  async run() {
    // fetch → parse → 返回 [{ customer, scale, amount, vendors, status, link, publishedAt }]
  },
}
```

然后在 `tenders.js` 的 `adapters` 数组中 import 进来。

### 招采站点接入现状（2026-07 调研）

| 站点 | 服务器相关度 | 结构 | 反爬 | 一期接入 |
|---|---|---|---|---|
| 中国政府采购网 [www.ccgp.gov.cn](http://www.ccgp.gov.cn/) | 中 | SSR | **强** — 命令行 UA 常触发频控 | 已接（`sites/ccgp.js`，失败静默） |
| 中国移动 [b2b.10086.cn](https://b2b.10086.cn/) | **高** | SPA | 中（UA/Referer 校验 + JS 渲染） | 二期（需 Playwright） |
| 中国联通 [chinaunicombidding.cn](https://www.chinaunicombidding.cn/) | 高 | SPA | 中 | 二期（需 Playwright） |
| 中国电信 [caigou.chinatelecom.com.cn](https://caigou.chinatelecom.com.cn/) | 高 | SPA | 中 | 二期 |
| 中国招标投标公共服务平台 [ctbpsp.com](https://ctbpsp.com/) | 高（聚合） | SPA | **强** — 滑块验证 + 参数加密 | 三期 |
| 国家电网、四大行等 | 低-中 | 多为 SPA + 需登录 | — | 三期 |

### 一期兜底方案：手工种子

爬虫短期跑不通的部分，用 [data/seed-tenders.json](data/seed-tenders.json) 手工维护重大采购事件（阿里云 800 亿、中国移动集采、字节 GPU 等）。适配器 `sites/seed.js` 会把这份 JSON 导入 tenders 表。

新增/修改条目：直接编辑 JSON，运行 `npm run fetch`（或等 cron）后前端即可看到。

### 二期接入 SPA 站点的建议路径

1. `npm i playwright-chromium`（约 300MB Chromium）
2. `src/fetchers/sites/cmcc.js` 等使用 Playwright 打开列表页 → 等待 XHR → 解析 JSON
3. 单站抓取频率 3-8 秒/页；数据入库仍走 `db.upsert('tenders', ...)`，前端零改动

若要跳过 Playwright，可考虑：
- 购买"聚源"、"招标雄"等专业招采数据 API（年费约 3-10 万）
- 抓上市公司公告（浪潮、中科曙光、工业富联的中标披露）作为侧面数据源

## 手工维护的数据

`data/static.json` 由编辑手工维护：
- KPI 卡片、行业观察（首页顶部）
- 产业链节点 / 连线 / 每层代表厂商
- 公司 / 产品库

保存后接口自动返回最新内容（有 mtime 缓存），前端刷新即可看到。

## API 一览

| Method | Path                     | 说明                    |
|--------|--------------------------|-------------------------|
| GET    | `/api/health`            | 存活探针                |
| GET    | `/api/kpi`               | 顶部 KPI 卡片           |
| GET    | `/api/insights`          | 行业观察 · 关注重点     |
| GET    | `/api/news`              | 资讯列表（q/tag/page）  |
| GET    | `/api/news/:id`          | 资讯详情                |
| GET    | `/api/supply-chain`      | 产业链节点 & 连线       |
| GET    | `/api/customer-orders`   | 客户采购动态            |
| GET    | `/api/companies`         | 公司 / 产品库           |
| GET    | `/api/fetch/rss`         | 手动触发抓取（调试用）  |
| GET    | `/api/fetch/tenders`     | 手动触发抓取（调试用）  |

## 换真数据库

- `src/db.js` 是唯一存储抽象，替换为 better-sqlite3 / Prisma / TypeORM 都行
- 路由和抓取器都只依赖 `db.upsert / query / findById` 这三个方法
