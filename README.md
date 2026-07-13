# ServerInsight · 服务器产业资讯网站

服务器行业的资讯门户 + 产业链图谱 + 大客户采购动态 + 公司/产品库。
本仓库目前是**前端框架 + Mock 数据**，便于先把页面跑起来，再逐步对接真实数据源。

## 技术栈

- Vue 3 + Vite 5
- Vue Router 4 / Pinia 2
- Element Plus（自动按需引入）
- Axios（统一 HTTP 出口）
- 预留 ECharts，用于后续把产业链/采购数据可视化

## 目录结构

```
server-news-site/
├── index.html
├── vite.config.js
├── .env                       # VITE_USE_MOCK 开关
├── src/
│   ├── main.js                # 入口
│   ├── App.vue
│   ├── router/                # 路由：首页 / 资讯 / 产业链 / 客户 / 公司
│   ├── api/                   # 业务接口（mock ↔ 真实 API 一键切换）
│   │   ├── http.js
│   │   └── index.js
│   ├── mock/                  # 示例数据（接入真实数据后可删）
│   ├── components/            # AppLayout / NewsCard / ChainGraph
│   ├── views/                 # 5 个核心页面
│   ├── stores/                # Pinia（按需添加）
│   └── assets/styles/         # 全局样式与设计变量
```

## 启动

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产出 dist/
```

> Node ≥ 18 推荐。

## 框架对应的产品模块

| 路由               | 模块             | 数据接口（src/api）       |
|--------------------|------------------|---------------------------|
| `/`                | 首页 / 概览      | `fetchKpi/News/Orders/Chain` |
| `/news`            | 行业资讯列表     | `fetchNews({q,tag,page})`  |
| `/news/:id`        | 资讯详情         | `fetchNewsById(id)`        |
| `/supply-chain`    | 产业链图谱       | `fetchSupplyChain()`       |
| `/customers`       | 大客户采购动态   | `fetchCustomerOrders()`    |
| `/companies`       | 公司 / 产品库    | `fetchCompanies()`         |

## 切换到真实数据

1. 在 `.env` 中设置：
   ```
   VITE_USE_MOCK=false
   VITE_API_BASE=https://your-api.example.com
   ```
2. 后端提供与 `src/api/index.js` 中接口一致的返回结构即可，前端无须改动。
3. 真实数据接入后可直接删除 `src/mock/` 目录。

## 数据接入建议（按优先级）

1. **官方 / 半官方公开数据**
   - 公司公告、招投标网站（中国移动 / 电信 / 联通采购）、上市公司财报
   - 适合作为「客户采购动态」的主源，权威且无版权风险
2. **RSS / 新闻聚合 API**
   - AnandTech / DigiTimes / 36Kr / 集微网 等
   - 适合作为「行业资讯」主源，部署成本最低
3. **自建爬虫**（按站点单独写 adapter）
   - 单独服务（Node + Playwright 或 Python + Scrapy）
   - 落 PostgreSQL，定时清洗 → 暴露 REST 给前端
4. **AI 摘要 / 标签**
   - 入库前对正文调用大模型做摘要、抽取「公司」「产品」「事件类型」字段
   - 可大幅提升资讯检索与产业链关联度

## 后续可扩展点

- 产业链图谱升级为 ECharts **Sankey** 或 **graph**，节点点击下钻
- 客户采购页加趋势图（采购金额 / 国产化率 / 厂商份额）
- 公司详情页：财报 / 产品线 / 上下游关系
- 加 RSS 输出 / 邮件订阅 / 站内全文检索（Meilisearch）
- 后端：Node (NestJS) 或 Python (FastAPI) + PostgreSQL + Redis 缓存

## License

仅作框架示例，数据来源请自行确认版权。
