// RSS 源清单 —— 编辑此文件即可增/减订阅源
// url: RSS 地址；tags: 抓取后默认打上的标签（也可后续用规则从标题里抽取）

export const rssSources = [
  // —— 综合科技 ——
  {
    name: '36Kr · 硬核科技',
    url: 'https://36kr.com/feed-newsflash',
    tags: ['科技', '资讯'],
  },
  {
    name: 'CNBeta',
    url: 'https://www.cnbeta.com.tw/backend.php',
    tags: ['科技'],
  },
  {
    name: 'Solidot',
    url: 'https://www.solidot.org/index.rss',
    tags: ['科技'],
  },

  // —— PC 中文评测/资讯 ——
  {
    name: 'IT 之家',
    url: 'https://www.ithome.com/rss/',
    tags: ['PC', '数码', '资讯'],
  },
  {
    name: '快科技 / 驱动之家',
    url: 'https://rss.mydrivers.com/rss.aspx',
    tags: ['PC', '硬件', '资讯'],
  },
  {
    name: '中关村在线 · 笔记本',
    url: 'https://feeds.zol.com.cn/nb.xml',
    tags: ['PC', '笔记本'],
  },
  {
    name: '中关村在线 · DIY 硬件',
    url: 'https://feeds.zol.com.cn/diy.xml',
    tags: ['PC', 'DIY'],
  },
  {
    name: '中关村在线 · 显示器',
    url: 'https://feeds.zol.com.cn/monitor.xml',
    tags: ['PC', '显示器'],
  },
  {
    name: '太平洋电脑网 · 笔记本',
    url: 'https://feeds.pconline.com.cn/nb/rss.xml',
    tags: ['PC', '笔记本'],
  },

  // —— 服务器/企业级硬件 ——
  {
    name: 'AnandTech',
    url: 'https://www.anandtech.com/rss/',
    tags: ['硬件', '海外'],
  },
  {
    name: 'ServeTheHome',
    url: 'https://www.servethehome.com/feed/',
    tags: ['服务器', '海外'],
  },

  // —— PC 海外评测 ——
  {
    name: "Tom's Hardware",
    url: 'https://www.tomshardware.com/feeds/all',
    tags: ['PC', '海外', '评测'],
  },
  {
    name: 'TechPowerUp',
    url: 'https://www.techpowerup.com/rss/news',
    tags: ['PC', '海外', 'DIY'],
  },
  {
    name: 'Notebookcheck',
    url: 'https://www.notebookcheck.net/News.152.100.html?type=rss',
    tags: ['PC', '海外', '笔记本'],
  },
]

// 关键词过滤：命中任一关键词才入库
// 覆盖 PC 全品类 + 服务器
export const keywordFilters = [
  // —— 服务器/AI 侧 ——
  '服务器', '芯片', 'HBM', 'DRAM', '算力', '液冷', '数据中心', 'IDC', '智算',
  'NVIDIA', 'AMD', 'Intel', '华为', '浪潮', '中科曙光', '海光', '寒武纪',
  '阿里云', '腾讯云', '字节', 'AWS', 'Azure', '云厂商', 'Capex',
  'server', 'datacenter', 'data center', 'H100', 'H200', 'B200', 'GB200', 'Blackwell',

  // —— PC 消费/DIY 侧 ——
  'CPU', 'GPU', 'SSD', '内存', '主板', '显卡', '存储',
  'AI PC', 'Copilot+', 'Copilot Plus', 'Ryzen', 'Core Ultra', 'Snapdragon X',
  '笔记本', '台式机', '游戏本', '轻薄本', '工作站', '一体机', 'AIO', 'Mini PC',
  '联想', '戴尔', '惠普', '华硕', '宏碁', '雷神', '机械革命', 'MacBook', 'iMac',
  'RTX', 'GeForce', 'Radeon', 'DIY', '装机', '整机',
  '罗技', '雷蛇', '樱桃', '机械键盘', '游戏鼠标', '显示器', 'OLED', 'Mini LED',
  'Panther Lake', 'Arrow Lake', 'Zen 5', 'Zen 6', 'RDNA', 'Strix Halo',
  '以旧换新', '3C 电脑', '京东电脑', '天猫笔记本',

  // —— 英文 PC 关键词 ——
  'laptop', 'notebook', 'desktop', 'motherboard', 'graphics card', 'GPU', 'CPU',
  'gaming PC', 'gaming laptop', 'monitor', 'peripheral', 'keyboard', 'mouse',
]
