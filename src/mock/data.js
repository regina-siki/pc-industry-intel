// 框架阶段的示例数据 —— 真实数据接入后此文件可直接删除。

export const mockKpi = [
  {
    label: '本月全球服务器出货量',
    value: '316 万台',
    delta: '+8.2%',
    up: true,
    source: 'IDC Server Tracker',
    formula: 'IDC 月度出货量报告，环比上月',
    updatedAt: '2026-06-28',
  },
  {
    label: 'AI 服务器占比',
    value: '24.6%',
    delta: '+5.1pp',
    up: true,
    source: 'TrendForce',
    formula: 'AI 服务器出货台数 ÷ 全球服务器总出货，pp = 百分点',
    updatedAt: '2026-06-25',
  },
  {
    label: 'DDR5 现货均价',
    value: '$4.21',
    delta: '-2.3%',
    up: false,
    source: 'DRAMeXchange 现货报价',
    formula: 'DDR5 16Gb 主流颗粒周均价，环比上周',
    updatedAt: '2026-06-27',
  },
  {
    label: '云厂商资本开支 (Q)',
    value: '$589 亿',
    delta: '+19%',
    up: true,
    source: '各公司季报',
    formula: 'AWS + Azure + GCP + Meta 四家最新季度 Capex 合计，YoY',
    updatedAt: '2026-05-31',
  },
]

// 行业观察 —— 编辑手工维护的关注要点，供首页顶部展示
export const mockInsights = {
  summary:
    '本月产业主线：AI 服务器需求继续外溢至 HBM 与液冷；北美云厂商 Capex 二次上修，国内运营商集采落地推动国产化率抬升；通用服务器价格战边际缓解。',
  updatedAt: '2026-06-30',
  highlights: [
    {
      key: 'ai',
      title: 'AI 服务器景气延续',
      level: 'high',
      points: [
        'NVIDIA Blackwell Ultra 拉动 HBM3e / CoWoS 产能持续紧张',
        '国内华为昇腾、寒武纪份额在互联网大客户中继续爬升',
      ],
    },
    {
      key: 'capex',
      title: '云厂商 Capex 上修',
      level: 'high',
      points: [
        '北美四大云厂 2026 Capex 指引上调 10-15%',
        '阿里云全年服务器采购预算上调至 800 亿元',
      ],
    },
    {
      key: 'localize',
      title: '国产化 & 运营商集采',
      level: 'mid',
      points: [
        '中国移动通用服务器集采：浪潮 41% / 华为 / 新华三中标',
        '关注海光、飞腾在金融政企场景的渗透节奏',
      ],
    },
    {
      key: 'cooling',
      title: '液冷渗透率突破 30%',
      level: 'mid',
      points: [
        '冷板式为当前主流，浸没式在智算中心持续放量',
        '英维克、高澜、申菱是订单主要受益方',
      ],
    },
    {
      key: 'risk',
      title: '需要警惕的风险',
      level: 'watch',
      points: [
        'HBM 供需若在 2027 年反转，AI 服务器 BOM 成本可能快速下降',
        '通用 x86 服务器价格战是否再起，取决于 Intel/AMD 新平台推货节奏',
      ],
    },
  ],
}

export const mockNews = [
  {
    id: 1,
    title: 'NVIDIA 发布下一代 Blackwell Ultra GPU，单卡 HBM3e 容量达 288GB',
    summary:
      'GTC 2026 上，NVIDIA 公布 Blackwell Ultra 平台，预计 Q3 量产，OEM 厂商已开始抢占 HBM3e 产能。',
    source: 'AnandTech',
    publishedAt: '2026-06-28',
    tags: ['GPU', 'AI 服务器', 'NVIDIA'],
    cover: '',
  },
  {
    id: 2,
    title: '工业富联 Q1 AI 服务器营收同比 +187%',
    summary:
      '财报显示 AI 服务器已成为主要增长引擎，公司 capex 主要投向云端 AI 整机柜与液冷产线。',
    source: '公司公告',
    publishedAt: '2026-06-25',
    tags: ['ODM', '财报', '液冷'],
    cover: '',
  },
  {
    id: 3,
    title: '阿里云 2026 全年服务器采购预算上调至 800 亿元',
    summary:
      '据供应链消息，阿里云将提高自研倚天 ARM 服务器与 GPU 整机柜采购比例，重点布局千亿模型推理集群。',
    source: '36Kr',
    publishedAt: '2026-06-22',
    tags: ['客户采购', '阿里云', 'ARM'],
    cover: '',
  },
  {
    id: 4,
    title: '三星宣布 HBM4 良率突破 70%，Q4 开始向头部 GPU 厂商送样',
    summary:
      'HBM4 单堆栈带宽较 HBM3e 提升 1.6 倍，预计 2027 年大规模商用，将推动新一代 AI 服务器架构升级。',
    source: 'DigiTimes',
    publishedAt: '2026-06-20',
    tags: ['HBM', '存储', '三星'],
    cover: '',
  },
  {
    id: 5,
    title: '中国移动 2026 年通用服务器集采开标：浪潮、华为、新华三中标',
    summary:
      '本次集采总规模 12.8 万台，金额约 165 亿元，浪潮份额 41%，国产化比例继续提升。',
    source: '运营商财经网',
    publishedAt: '2026-06-18',
    tags: ['客户采购', '运营商', '集采'],
    cover: '',
  },
  {
    id: 6,
    title: '液冷渗透率突破 30%：英维克、高澜、申菱拿下头部互联网订单',
    summary:
      '冷板式液冷因部署友好成为当前主流，浸没式液冷在 AI 智算中心持续放量。',
    source: '行业研究',
    publishedAt: '2026-06-15',
    tags: ['液冷', '散热'],
    cover: '',
  },
]

// 产业链：上游(芯片/存储/电源) -> 中游(OEM/ODM) -> 下游(云厂商/运营商/企业)
export const mockSupplyChain = {
  nodes: [
    { id: 'cpu', name: 'CPU', layer: 'upstream' },
    { id: 'gpu', name: 'GPU / 加速卡', layer: 'upstream' },
    { id: 'mem', name: '内存 / HBM', layer: 'upstream' },
    { id: 'storage', name: '存储 (SSD/HDD)', layer: 'upstream' },
    { id: 'pcb', name: 'PCB / 连接器', layer: 'upstream' },
    { id: 'power', name: '电源 / 散热', layer: 'upstream' },

    { id: 'oem', name: 'OEM 品牌商', layer: 'mid' },
    { id: 'odm', name: 'ODM 代工', layer: 'mid' },
    { id: 'sysint', name: '系统集成商', layer: 'mid' },

    { id: 'hyper', name: '互联网 / 云厂商', layer: 'downstream' },
    { id: 'telco', name: '运营商', layer: 'downstream' },
    { id: 'gov', name: '政企 / 金融', layer: 'downstream' },
    { id: 'idc', name: 'IDC / 智算中心', layer: 'downstream' },
  ],
  links: [
    { source: 'cpu', target: 'oem' },
    { source: 'cpu', target: 'odm' },
    { source: 'gpu', target: 'oem' },
    { source: 'gpu', target: 'odm' },
    { source: 'mem', target: 'oem' },
    { source: 'mem', target: 'odm' },
    { source: 'storage', target: 'oem' },
    { source: 'storage', target: 'odm' },
    { source: 'pcb', target: 'odm' },
    { source: 'power', target: 'odm' },
    { source: 'oem', target: 'hyper' },
    { source: 'oem', target: 'telco' },
    { source: 'oem', target: 'gov' },
    { source: 'odm', target: 'hyper' },
    { source: 'odm', target: 'idc' },
    { source: 'sysint', target: 'gov' },
    { source: 'sysint', target: 'idc' },
  ],
  companies: {
    cpu: ['Intel', 'AMD', '海光', '飞腾'],
    gpu: ['NVIDIA', 'AMD', '华为昇腾', '寒武纪'],
    mem: ['SK Hynix', 'Samsung', 'Micron', '长鑫'],
    storage: ['Samsung', '西部数据', '长江存储'],
    pcb: ['沪电股份', '生益科技', '深南电路'],
    power: ['台达', '英维克', '高澜'],
    oem: ['Dell', 'HPE', 'Lenovo', '浪潮', '新华三', '华为'],
    odm: ['工业富联', '广达', '英业达', '纬颖'],
    sysint: ['中科曙光', '紫光股份'],
    hyper: ['阿里云', '腾讯云', '字节', '百度', 'AWS', 'Azure'],
    telco: ['中国移动', '中国电信', '中国联通'],
    gov: ['工行', '建行', '国家电网'],
    idc: ['世纪互联', '万国数据', '光环新网'],
  },
}

export const mockCustomerOrders = [
  {
    customer: '阿里云',
    period: '2026 Q2',
    scale: '4.5 万台',
    amount: '约 78 亿元',
    type: 'AI 训练 / 推理服务器',
    vendors: ['浪潮', '工业富联', '超聚变'],
    status: '执行中',
  },
  {
    customer: '中国移动',
    period: '2026 H1',
    scale: '12.8 万台',
    amount: '约 165 亿元',
    type: '通用 x86 服务器',
    vendors: ['浪潮', '华为', '新华三'],
    status: '已开标',
  },
  {
    customer: '字节跳动',
    period: '2026 Q2',
    scale: '约 3 万台',
    amount: '未披露',
    type: 'GPU 整机柜 (H200 / B200)',
    vendors: ['工业富联', '广达'],
    status: '出货中',
  },
  {
    customer: '腾讯云',
    period: '2026 Q1-Q2',
    scale: '2.2 万台',
    amount: '约 41 亿元',
    type: '存储 / 通用混合',
    vendors: ['浪潮', '联想', '宁畅'],
    status: '已交付',
  },
  {
    customer: 'AWS',
    period: '2026 H1',
    scale: '估算 25 万台',
    amount: '未披露',
    type: 'Trainium 2 自研 + GPU',
    vendors: ['Wiwynn', '广达'],
    status: '执行中',
  },
]

export const mockCompanies = [
  { name: 'NVIDIA', category: 'GPU', country: '美国', tags: ['AI', '上游'] },
  { name: 'Intel', category: 'CPU', country: '美国', tags: ['x86', '上游'] },
  { name: 'AMD', category: 'CPU/GPU', country: '美国', tags: ['x86', 'GPU'] },
  { name: '华为昇腾', category: 'GPU', country: '中国', tags: ['国产', 'AI'] },
  { name: '海光信息', category: 'CPU', country: '中国', tags: ['国产', 'x86'] },
  { name: 'SK Hynix', category: '存储', country: '韩国', tags: ['HBM', 'DRAM'] },
  { name: '工业富联', category: 'ODM', country: '中国', tags: ['代工', 'AI 整机柜'] },
  { name: '浪潮信息', category: 'OEM', country: '中国', tags: ['品牌', 'AI 服务器'] },
  { name: '超聚变', category: 'OEM', country: '中国', tags: ['品牌', '通用'] },
  { name: 'Dell', category: 'OEM', country: '美国', tags: ['品牌'] },
  { name: '英维克', category: '散热', country: '中国', tags: ['液冷'] },
  { name: '台达', category: '电源', country: '中国台湾', tags: ['电源'] },
]
