// 产业链层级 & 关键词映射（供 news 路由和 wechat 入库共用）
// 品类切换时替换本文件即可
// 覆盖 PC 全品类：消费级 PC + AI PC + DIY + 工作站 + AI 服务器 + 显示器 + 外设
//
// 品类口径（side 字段，配合 src/lib/category-map.js 使用）：
//   server = 服务器 / 工作站 / 桌面 AI 产品
//   pc     = 台式机 / 一体机相关产品（含 MiniPC、游戏台机；不含 DIY 散件、不含笔记本）
//   both   = 两品类都显示
//   none   = 仅在「全部」显示（DIY 散件 / 外设 / 笔记本链）

export const CHAIN_TAXONOMY = [
  {
    id: 'upstream',
    name: '上游 · 元器件',
    subCategories: [
      // —— 服务器/AI 加速侧 ——
      { key: 'gpu', name: '数据中心 GPU / 加速卡', side: 'server', keywords: ['数据中心 GPU', 'NVIDIA H100', 'NVIDIA H200', 'AMD Instinct', 'MI300', 'MI325', 'B200', 'Blackwell', 'GB200', 'GB300', '昇腾', '寒武纪', '海光深算', 'TPU', 'Trainium'] },
      { key: 'cpu', name: '服务器 CPU', side: 'server', keywords: ['Xeon', 'EPYC', '海光', '飞腾', '鲲鹏', 'ARM 服务器', 'Ampere', 'AmpereOne', 'Graviton'] },
      { key: 'memory', name: 'HBM / 服务器内存', side: 'server', keywords: ['HBM', 'HBM3', 'HBM3e', 'HBM4', 'SK Hynix', 'Samsung Memory', '长鑫', 'RDIMM', 'LRDIMM', 'CXL'] },
      { key: 'storage', name: '企业级 SSD / 存储', side: 'server', keywords: ['企业 SSD', 'NVMe', 'PCIe 5.0 SSD', 'PCIe 6.0', '长江存储', '西部数据', '铠侠', 'QLC 企业盘'] },
      { key: 'pcb', name: 'PCB / 连接器', side: 'server', keywords: ['PCB', '沪电', '生益', '深南电路', 'CCL', '高频高速覆铜板'] },
      { key: 'power', name: '电源 / 散热 / 液冷', side: 'server', keywords: ['液冷', '浸没式', '冷板', '散热', '电源', '英维克', '高澜', '台达', '申菱', '朗博科技'] },

      // —— PC 消费/DIY 侧 ——
      { key: 'pc-gpu', name: '消费显卡 / AIC', side: 'pc', keywords: ['RTX', 'GeForce', 'Radeon RX', 'RDNA', 'RTX 5090', 'RTX 5080', 'RTX 5070', 'RTX 4090', 'RX 9070', 'RX 8800', 'Intel Arc', '影驰', '七彩虹', '技嘉显卡', '华硕显卡', '微星显卡', '铭瑄', 'PNY', 'AIC 显卡', 'AIC 品牌', '显卡新品', '显卡首发', '首发显卡'] },
      { key: 'pc-cpu', name: 'PC CPU', side: 'pc', keywords: ['Core Ultra', 'Ryzen', 'Ryzen AI', 'Ryzen 9', 'Ryzen 7', 'Ryzen 5', 'Zen 5', 'Zen 6', 'Arrow Lake', 'Panther Lake', 'Lunar Lake', 'Meteor Lake', 'Snapdragon X Elite', '骁龙 X', 'Apple M4', 'Apple M5'] },
      { key: 'motherboard', name: '主板', side: 'none', keywords: ['主板', '华硕主板', '技嘉主板', '微星主板', '华擎', 'ROG STRIX', 'ROG MAXIMUS', 'ROG CROSSHAIR', 'B850', 'X870', 'Z890', 'B650', 'X670', 'AM5', 'LGA1851', 'LGA1700'] },
      { key: 'ram-diy', name: 'DIY 内存条', side: 'none', keywords: ['DDR5', 'DDR5-6400', 'DDR5-7200', 'DDR5-8000', '内存条', '金士顿', '海盗船', '威刚', '十铨', '芝奇', 'G.Skill', '光威'] },
      { key: 'ssd-consumer', name: '消费级 SSD', side: 'none', keywords: ['消费 SSD', 'M.2 SSD', 'PCIe 5.0 SSD', '三星 990', '铠侠 SSD', '致态', '海力士 P41', '雷克沙', '西数 SN'] },
      { key: 'case-cooler', name: '机箱 / 散热', side: 'none', keywords: ['机箱', '散热器', '风冷', '一体水冷', '360 水冷', '利民', '九州风神', '追风者', '联力', '玩嘉', '猫头鹰'] },
      { key: 'monitor', name: '显示器', side: 'none', keywords: ['显示器', '游戏显示器', 'OLED 显示器', 'Mini LED', '4K 显示器', 'HDR', '刷新率', '240Hz', '360Hz', '曲面屏', 'LG 显示器', 'Dell 显示器', 'AOC', '明基', '优派'] },
      { key: 'peripheral', name: '外设（键鼠/音频）', side: 'none', keywords: ['机械键盘', '游戏鼠标', '耳机', '耳麦', '罗技', '雷蛇', 'Razer', '樱桃', 'Cherry', 'HHKB', 'FILCO', 'HyperX', 'SteelSeries'] },
    ],
  },
  {
    id: 'mid',
    name: '中游 · 整机制造',
    subCategories: [
      // —— 服务器 ——
      { key: 'oem', name: '服务器 OEM', side: 'server', keywords: ['浪潮', '华为服务器', '新华三', 'Dell PowerEdge', 'HPE ProLiant', '超聚变', '宁畅'] },
      { key: 'odm', name: '服务器 ODM', side: 'server', keywords: ['工业富联', '广达', '英业达', '纬颖', 'Wiwynn', 'Foxconn'] },

      // —— PC ——
      { key: 'pc-oem', name: 'PC 品牌 (笔电/台机)', side: 'pc', keywords: ['联想笔记本', 'ThinkPad', 'ThinkBook', '小新', '拯救者', '联想开天', '联想扬天', '联想启天', '戴尔笔记本', 'XPS', 'Alienware', '惠普笔记本', '暗影精灵', '光影精灵', '华硕笔记本', 'ROG 笔记本', '灵耀', '天选', '宏碁', '掠夺者', 'Acer', '雷神游戏本', '雷神笔记本', '机械革命', '雷鸟笔记本', 'MacBook', 'Mac mini', 'Mac Studio', 'iMac', 'iPad', '清华同方 超越', '同方超越', '长城商用', '神舟战神'] },
      { key: 'nb-odm', name: '笔记本 ODM', side: 'none', keywords: ['笔电 ODM', '仁宝', '纬创', '英业达笔电', '和硕', 'Compal', 'Wistron', '广达笔电'] },
      { key: 'aio-mini', name: 'AIO / MiniPC', side: 'pc', keywords: ['一体机 PC', 'AIO', 'Mini PC', '迷你 PC', '零刻', '铭凡', 'MINISFORUM', 'Intel NUC', 'Strix Halo', 'DGX Spark', 'Ryzen AI Max'] },
    ],
  },
  {
    id: 'downstream',
    name: '下游 · 终端客户',
    subCategories: [
      // —— 服务器 ——
      { key: 'hyperscaler', name: '互联网 / 云厂商', side: 'server', keywords: ['阿里云', '腾讯云', '字节跳动', '百度智能云', 'AWS', 'Azure', 'Meta', 'Google Cloud', 'Capex', '资本开支'] },
      { key: 'telco', name: '运营商', side: 'server', keywords: ['中国移动', '中国联通', '中国电信', '集采'] },
      { key: 'gov', name: '政企 / 政府 / 金融', side: 'server', keywords: ['政府', '政企', '金融', '智算中心', '算力券', '东数西算', '信创'] },

      // —— PC ——
      { key: 'pc-retail', name: 'PC 零售 (线上线下 3C)', side: 'pc', keywords: ['京东 3C', '京东电脑', '天猫笔记本', '苏宁电脑', '国美 3C', '3C 卖场', '笔记本销量', '笔记本榜', '618 电脑', '双 11 笔记本', '以旧换新', '京东 618', '天猫双 11'] },
      { key: 'pc-diy', name: 'DIY 玩家', side: 'none', keywords: ['DIY', '装机', '整机', '硬件评测', '中关村在线', '太平洋电脑网', 'Chiphell', '硬件哔哔', '极客湾', '笔吧评测室', '超能网'] },
      { key: 'pc-enterprise', name: '企业 IT / 商用采购', side: 'pc', keywords: ['企业购', '商用笔记本', '办公电脑', '央国企 IT 采购', '党政办公', '公务电脑'] },
      { key: 'pc-education', name: '教育 / 网吧 / 电竞馆', side: 'pc', keywords: ['教育采购', '学校电脑', '教育信息化', '网吧', '电竞馆', '电竞酒店', '云网吧'] },
      { key: 'pc-gaming', name: '游戏 / 电竞玩家', side: 'pc', keywords: ['游戏本', '电竞主机', 'ROG', '外星人', '主机玩家', '电竞外设', 'Steam 硬件', '游戏 PC'] },
      { key: 'smb-consumer', name: '小 B / 个人 (AI PC / 桌面 AI)', side: 'both', keywords: ['工作站', '桌面 AI', 'DGX Spark', 'Strix Halo', 'Ryzen AI Max', 'Mac Studio', 'M4 Ultra', 'AI PC', 'Copilot+', '轻薄本', '生产力笔记本', '设计师笔记本'] },
    ],
  },
  {
    id: 'other',
    name: '综合 / 其他',
    subCategories: [
      { key: 'other', name: '综合', side: 'both', keywords: [] },
    ],
  },
]

// 根据标题+摘要分派到产业链的 layer/sub。返回 {layer, sub, layerName, subName, side}
export function classify(row) {
  const text = `${row.title || ''} ${row.summary || ''}`
  for (const layer of CHAIN_TAXONOMY) {
    for (const sub of layer.subCategories) {
      if (sub.keywords.some((kw) => text.includes(kw))) {
        return {
          layer: layer.id,
          sub: sub.key,
          layerName: layer.name,
          subName: sub.name,
          side: sub.side,
        }
      }
    }
  }
  return {
    layer: 'other',
    sub: 'other',
    layerName: '综合 / 其他',
    subName: '综合',
    side: 'both',
  }
}

// 根据分类推荐一个公众号 category（用于自动收录）
export function suggestAccountCategory(cls) {
  const map = {
    // 服务器/AI 侧
    gpu: 'AI 芯片', cpu: '半导体', memory: '半导体', storage: '存储',
    pcb: '半导体', power: '散热/电源',
    oem: '服务器/存储', odm: '服务器/存储',
    hyperscaler: '互联网/云', telco: '运营商', gov: '政企/政府',
    // PC 侧
    'pc-gpu': '显卡/主板', 'pc-cpu': '半导体',
    motherboard: '显卡/主板', 'ram-diy': 'DIY',
    'ssd-consumer': 'DIY', 'case-cooler': 'DIY',
    monitor: '显示器', peripheral: '外设',
    'pc-oem': 'PC/笔记本', 'nb-odm': 'PC/笔记本', 'aio-mini': 'PC/笔记本',
    'pc-retail': 'PC/笔记本', 'pc-diy': 'DIY',
    'pc-enterprise': 'PC/笔记本', 'pc-education': 'PC/笔记本', 'pc-gaming': '游戏/电竞',
    'smb-consumer': 'AI PC',
  }
  return map[cls.sub] || '综合'
}
