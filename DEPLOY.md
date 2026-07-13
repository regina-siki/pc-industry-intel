# 部署到京东内部（JDOS / JCloud / 内网机器）

本文档面向：把这个网站部署到京东内部平台，让同事通过内网域名访问。

## 交付形态

**单镜像**：前端静态包 + Node 后端 打包在同一个 Docker 镜像里
- Express 一个进程既服务 `/api/*` 也托管前端 SPA
- 端口 `8787`
- 数据以 JSON 文件形式持久化（`server/data/`）

## 快速开始（本地验证）

### 方式 A：Docker 构建 + 运行

```bash
cd /path/to/server-news-site

# 构建镜像（首次约 3-5 分钟）
docker build -t server-news-site:latest .

# 运行（前台）
docker run --rm -p 8787:8787 server-news-site:latest

# 或后台运行 + 数据卷持久化
docker run -d --name server-news-site \
  -p 8787:8787 \
  -v $(pwd)/server/data:/app/server/data \
  server-news-site:latest

# 打开 http://localhost:8787
```

### 方式 B：不用 Docker，本地直接跑

```bash
# 前端构建
npm install
npm run build

# 拷贝到后端 public/
cp -r dist server/public

# 后端跑（生产模式）
cd server && npm install --omit=dev
NODE_ENV=production npm start
# 访问 http://localhost:8787
```

## 部署到 JDOS

京东内部 JDOS 部署流程各 BU 略有差异，通用步骤：

1. **推镜像到 JDOS 私有 Registry**
   ```bash
   docker tag server-news-site:latest hub.jd.local/YOUR-NAMESPACE/server-news-site:v1.0
   docker push hub.jd.local/YOUR-NAMESPACE/server-news-site:v1.0
   ```
   （具体 registry 地址问 JDOS 平台或 SRE）

2. **在 JDOS 控制台创建应用**
   - 镜像：`hub.jd.local/YOUR-NAMESPACE/server-news-site:v1.0`
   - 端口：`8787`
   - 健康检查：`GET /api/health` → 期望 200
   - 副本数：`1`（数据在本地 JSON，多副本会写冲突；后续换 SQLite/PG 再水平扩展）
   - 环境变量：
     - `NODE_ENV=production`
     - `PORT=8787`
     - `FETCH_CRON=5 * * * *`（每小时 5 分抓 RSS）

3. **持久化数据（关键）**
   容器内的 `/app/server/data/` 是所有资讯 / 政策 / 客户 JSON 数据。JDOS 挂云盘或 NAS：
   - 容器路径：`/app/server/data`
   - 挂载空目录会**清空初始数据**，两个选择：
     - **A. 初始化后再挂载**：镜像 `data/` 已含默认 JSON。先起容器让它把默认数据写盘，再挂 volume。
     - **B. init container 拷贝**：JDOS 支持的话，用 init container 把镜像里 `/app/server/data` 拷贝到 volume 后再挂。

4. **绑定内网域名**
   通过 JDOS 域名管理绑一个 `serverinsight.jd.local` 之类的域名，指向该应用。你就得到了一个可分享的链接。

## 目录说明

```
server-news-site/
├── Dockerfile            # 三阶段构建
├── .dockerignore
├── package.json          # 前端
├── vite.config.js
├── index.html
├── src/                  # 前端源码
├── server/
│   ├── package.json      # 后端
│   ├── src/              # 后端源码
│   ├── data/             # 所有 JSON 数据（重要，需持久化）
│   └── public/           # 构建时 Docker 会把前端 dist/ 复制到这里
└── dist/                 # 前端构建产物（本地 build 后生成）
```

## 环境变量

| 名称           | 默认值                    | 说明                           |
|----------------|---------------------------|--------------------------------|
| `PORT`         | `8787`                    | HTTP 端口                      |
| `NODE_ENV`     | `production`              | 生产模式                       |
| `DB_PATH`      | `./data/news.db.json`     | 资讯数据库文件路径             |
| `FETCH_CRON`   | `5 * * * *`               | RSS 抓取定时任务表达式         |
| `FETCH_TIMEOUT`| `15000`                   | 单次抓取超时（毫秒）           |
| `FETCH_RATE_MS`| `2000`                    | 站点抓取最小间隔               |

## 数据更新方式

生产环境有两种维护方式：

1. **代码级更新**：改 `server/data/*.json` → 重新 build 镜像 → 发版
2. **热更新（推荐 demo 场景）**：在 JDOS 控制台挂载 volume 后，直接 kubectl cp 或 SFTP 更新 JSON 文件。Express 有 mtime 缓存，改完 3-5 秒生效，无需重启。

## 关于对外访问

- **京东内网可访问的域名**：JDOS 绑定即可
- **外网访问**：JDOS 通常需要额外的 waf / 外网映射配置，找 SRE 帮忙
- **Basic Auth**：如需限制"只有拿到链接的人"能进，可以在 Express 前加 `express-basic-auth` 中间件，或者由 JDOS 的 Ingress 层加

## 快速自查清单

发版前跑一次：

```bash
# 1. 前端构建成功？
npm run build

# 2. 单进程能跑起来？
cp -r dist server/public
cd server && NODE_ENV=production node src/index.js &
curl http://localhost:8787/api/health   # 期望 {"ok": true}
curl -o /dev/null -w "%{http_code}\n" http://localhost:8787/   # 期望 200

# 3. Docker 能构建？
docker build -t test .
docker run --rm -p 8788:8787 test &
curl http://localhost:8788/api/health
```

## 后续演进

- 数据量大后 `server/data/news.db.json` 会变成 GB 级 → 换 SQLite/PostgreSQL
- 多副本部署 → data 层要换成外部 DB
- 需要用户登录 / 权限 → JDOS 通常有 SSO 中间件，或前端接 ERP 登录
