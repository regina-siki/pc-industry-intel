// 品类拆分映射 · 全站唯一真相源
// 口径（与用户确认）：
//   pc     = 台式机 / 一体机相关产品（含 MiniPC、游戏台机；不含 DIY 散件、不含笔记本）
//   server = 服务器 / 工作站（含桌面 AI 产品：Strix Halo 工作站、Mac Studio、DGX Spark 等）
//   both   = 两个品类都显示
//   none   = 仅在「全部」显示（DIY 散件 / 外设 / 笔记本链）
// 激活品类 activeSide 取值：'all' | 'pc' | 'server'

export const SIDES = ['all', 'pc', 'server']

export const TAG_LABELS = {
  all: '全部',
  pc: '台式机 · 一体机',
  server: '服务器 · 工作站',
}

// static.json supplyChain.nodes 的 id → side
export const NODE_SIDE = {
  // 服务器侧（13）
  cpu: 'server', gpu: 'server', mem: 'server', storage: 'server', pcb: 'server', power: 'server',
  oem: 'server', odm: 'server', sysint: 'server',
  hyper: 'server', telco: 'server', gov: 'server', idc: 'server',
  // PC 消费侧（8）
  'pc-cpu': 'pc', 'pc-gpu-aic': 'pc', 'pc-oem': 'pc', 'aio-mini': 'pc',
  'pc-retail': 'pc', 'pc-enterprise': 'pc', 'pc-education': 'pc', 'pc-gaming': 'pc',
  // 仅「全部」（8）：DIY 散件 / 外设 / 笔记本链
  mb: 'none', 'ram-diy': 'none', 'ssd-consumer': 'none',
  'case-cooler': 'none', monitor: 'none', peripheral: 'none',
  'pc-diy': 'none', 'nb-odm': 'none',
}

// chain-taxonomy.js CHAIN_TAXONOMY 的 sub key → side
export const SUB_SIDE = {
  // 服务器侧
  gpu: 'server', cpu: 'server', memory: 'server', storage: 'server', pcb: 'server', power: 'server',
  oem: 'server', odm: 'server', hyperscaler: 'server', telco: 'server', gov: 'server',
  // PC 消费侧
  'pc-gpu': 'pc', 'pc-cpu': 'pc', 'pc-oem': 'pc', 'aio-mini': 'pc',
  'pc-retail': 'pc', 'pc-enterprise': 'pc', 'pc-education': 'pc', 'pc-gaming': 'pc',
  // 两品类都显示（smb-consumer 关键词混工作站 + AI PC）
  'smb-consumer': 'both', other: 'both',
  // 仅「全部」
  motherboard: 'none', 'ram-diy': 'none', 'ssd-consumer': 'none',
  'case-cooler': 'none', monitor: 'none', peripheral: 'none',
  'pc-diy': 'none', 'nb-odm': 'none',
}

// bom.json products 的 id → side
export const BOM_SIDE = {
  'dgx-b200': 'server', 'amd-395-ws': 'server',
  'gaming-desktop-2026': 'pc', 'mac-mini-m4': 'pc',
  'mini-pc-strix-halo': 'pc', 'all-in-one-aio-2026': 'pc',
  // 笔记本：仅「全部」
  'gaming-laptop-rtx5090': 'none', 'ai-pc-copilot': 'none',
}

// bom.json componentNewsImpact 的 component 精确名 → side
export const COMPONENT_SIDE = {
  'HBM3e / HBM4': 'server', 'GPU (B300)': 'server',
  '液冷 / 散热': 'server', 'PCB / 高速连接器': 'server',
  'RTX 5090/5080 消费显卡': 'pc', 'DDR5-8000 高频内存条': 'pc',
  'OLED 笔记本面板': 'pc', 'NPU (AI PC 认证芯片)': 'pc',
  'LPDDR5X': 'both', 'NAND / SSD': 'both',
}

// product-lifecycle.json categories 的 id → side
export const LIFECYCLE_CAT_SIDE = {
  desktop: 'pc', aio: 'pc', 'gaming-desktop': 'pc', 'mini-pc': 'pc',
  server: 'server',
}

// customers.json segments 的 id → side
// smb/consumer 聚焦 AI 工作站 / 桌面推理 / 本地部署，两品类都显示
export const SEGMENT_SIDE = {
  hyperscaler: 'server', telco: 'server', 'gov-ai': 'server', 'gov-finance': 'server',
  smb: 'both', consumer: 'both',
  'pc-retail': 'pc', 'pc-enterprise': 'pc', 'pc-education': 'pc',
  'pc-diy': 'none',
}

// customers.json consumer/smb Personas 的层级编号（L1..L5 / S1..S7）→ side
// workstations / 桌面 AI 服务器大量面向个人开发者与小 B，故 L3/L4/S2-S5 归 server 侧
export const PERSONA_SIDE = {
  L1: 'none',   // AI 轻办公笔记本 / iPad
  L2: 'pc',     // 创作者台式机
  L3: 'server', // 双卡 4090 / DGX Spark 工作站
  L4: 'server', // Strix Halo / Mac Studio / DGX Spark
  L5: 'none',   // AI 旗舰手机
  S1: 'pc',     // RTX 台式机
  S2: 'server', // DGX Spark / AI Max+ 395 主控
  S3: 'server', // H100/H200/B200 服务器
  S4: 'server', // 边缘盒子 + 工作站本地部署
  S5: 'server', // GPU 集群 + 教学工作站
  S6: 'none',   // 电竞主机 + 外设
  S7: 'pc',     // 国产商用 AIO 一体机
}

// user-match.json matches 的 personaTier 层级编号（L1..L5 / S1..S7）→ side
// 口径：笔记本 / 手机 / DIY 电竞外设仅在「全部」显示；工作站归服务器侧
export const MATCH_SIDE = {
  L1: 'none',   // AI 轻办公笔记本 / iPad
  L2: 'pc',     // 创作者台式机
  L3: 'server', // 本地视频推理工作站
  L4: 'server', // 统一内存工作站
  L5: 'none',   // AI 旗舰手机
  S1: 'pc',     // 创作者台式机
  S2: 'both',   // GPU 台式机机群 + 工作站
  S3: 'server', // GPU 服务器
  S4: 'server', // 边缘盒子 + 本地部署工作站
  S5: 'server', // GPU 集群 + 教学工作站
  S6: 'none',   // 电竞主机 + 外设
  S7: 'pc',     // 国产商用 AIO 一体机
}

// overview.json jdRecommendations 的 title → side
// 口径：台式机/一体机不含 DIY 散件、不含笔记本，故 DIY 装机/游戏本/显卡包销仅在「全部」显示
export const JD_RECO_SIDE = {
  'AI PC 认证专区': 'pc',
  '以旧换新联动 - 国补一站式入口': 'pc',
  '教育信息化 PC 集采': 'pc',
  '央国企办公电脑集采 · 国产化率 60%+': 'pc',
  '上架国产 AI 服务器整机 & 昇腾 / 寒武纪 加速卡': 'server',
  '政府 AI 采购竞标': 'server',
  '锁定 HBM 降价窗口 → 卖点包装': 'server',
  'B300 上市前锁 H200/H100 尾货': 'server',
  'AI PC & 本地大模型评测专栏': 'both',
  '以租代购 / 分期方案': 'both',
  '本地部署 + 售后：显性差异化': 'both',
  '游戏本电竞主题旗舰馆': 'none',
  'DIY 装机套装 + 攻略': 'none',
  '电竞馆合作 + 装机直播': 'none',
  '显卡零售包销 · 主控三家 AIC': 'none',
}

// wechat-accounts.json 的 category（中文）→ side；未覆盖值默认 both
export const WECHAT_CATEGORY_SIDE = {
  '半导体': 'server', '算力': 'server', '服务器/存储': 'server',
  '互联网/云': 'server', '运营商': 'server', '政企/政府': 'server',
  '显卡/主板': 'pc', 'DIY': 'pc', '显示器': 'pc', '外设': 'pc',
  'PC/笔记本': 'pc', 'AI PC': 'pc', '游戏/电竞': 'pc',
  'AI': 'both', 'AI 芯片': 'both', '综合': 'both',
  '大厂官方': 'both', '券商研报': 'both',
}

// 通用映射兜底：NODE / SUB / SEGMENT 等表里未声明的项默认 both
export function sideOf(map, key, fallback = 'both') {
  const v = map[key]
  return v === undefined ? fallback : v
}

// 可见性判定：all → 全部可见（含 none）；pc/server → 只见本侧 + both
export function visible(itemSide, activeSide) {
  if (activeSide === 'all') return true
  return itemSide === activeSide || itemSide === 'both'
}

// 归一化激活品类：非法值回落 all
export function validSide(v) {
  return SIDES.includes(v) ? v : 'all'
}
