# ============ Stage 1: build frontend ============
FROM node:20-alpine AS frontend-build

WORKDIR /app

# 用国内镜像加速（京东内部可换成 npm-registry.jd.com）
ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN npm config set registry $NPM_REGISTRY

# 前端依赖
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# 前端代码
COPY vite.config.js index.html ./
COPY src ./src

# 构建到 dist/
RUN npm run build


# ============ Stage 2: install backend deps ============
FROM node:20-alpine AS backend-deps

WORKDIR /app/server

ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN npm config set registry $NPM_REGISTRY

COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund


# ============ Stage 3: runtime ============
FROM node:20-alpine AS runtime

WORKDIR /app

# 后端代码 + 依赖
COPY --from=backend-deps /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/package.json
COPY server/src ./server/src
COPY server/data ./server/data

# 前端构建产物 → server/public/ ，Express 会自动托管
COPY --from=frontend-build /app/dist ./server/public

ENV NODE_ENV=production
ENV PORT=8787
ENV DB_PATH=./data/news.db.json
ENV FETCH_CRON="5 * * * *"

EXPOSE 8787

WORKDIR /app/server
CMD ["node", "src/index.js"]
