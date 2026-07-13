// RSS 源清单 —— 编辑此文件即可增/减订阅源
// url: RSS 地址；tags: 抓取后默认打上的标签（也可后续用规则从标题里抽取）

export const rssSources = [
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
]

// 关键词过滤：命中任一关键词才入库，避免非服务器内容
export const keywordFilters = [
  '服务器', '芯片', 'CPU', 'GPU', 'HBM', 'DRAM', 'SSD', '存储',
  'AI 算力', '算力', '液冷', '数据中心', 'IDC', '智算',
  'NVIDIA', 'AMD', 'Intel', '华为', '浪潮', '中科曙光', '海光', '寒武纪',
  '阿里云', '腾讯云', '字节', 'AWS', 'Azure', '云厂商',
  'server', 'GPU', 'CPU', 'HBM', 'datacenter', 'data center',
]
