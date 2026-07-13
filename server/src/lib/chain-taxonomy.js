// 产业链层级 & 关键词映射（供 news 路由和 wechat 入库共用）
// 品类切换时替换本文件即可

export const CHAIN_TAXONOMY = [
  {
    id: 'upstream',
    name: '上游 · 元器件',
    subCategories: [
      { key: 'gpu', name: 'GPU / 加速卡', keywords: ['GPU', 'NVIDIA', 'AMD Instinct', '昇腾', '寒武纪', 'B200', 'H100', 'H200', 'Blackwell'] },
      { key: 'cpu', name: 'CPU', keywords: ['CPU', 'Xeon', 'EPYC', '海光', '飞腾', 'ARM 服务器', 'Ampere'] },
      { key: 'memory', name: '内存 / HBM', keywords: ['HBM', 'DDR5', 'LPDDR', 'DRAM', 'SK Hynix', 'Samsung Memory', '长鑫'] },
      { key: 'storage', name: '存储 / SSD', keywords: ['SSD', 'NAND', 'NVMe', '长江存储', '西部数据'] },
      { key: 'pcb', name: 'PCB / 连接器', keywords: ['PCB', '沪电', '生益', '深南电路'] },
      { key: 'power', name: '电源 / 散热 / 液冷', keywords: ['液冷', '散热', '电源', '英维克', '高澜', '台达', '申菱'] },
    ],
  },
  {
    id: 'mid',
    name: '中游 · 整机制造',
    subCategories: [
      { key: 'oem', name: 'OEM 品牌', keywords: ['浪潮', '华为', '新华三', '联想', 'Dell', 'HPE', '超聚变', '宁畅'] },
      { key: 'odm', name: 'ODM 代工', keywords: ['工业富联', '广达', '英业达', '纬颖', 'Wiwynn', 'Foxconn'] },
    ],
  },
  {
    id: 'downstream',
    name: '下游 · 终端客户',
    subCategories: [
      { key: 'hyperscaler', name: '互联网 / 云厂商', keywords: ['阿里云', '腾讯云', '字节', '百度', 'AWS', 'Azure', 'Meta', 'Google Cloud', 'Capex', '资本开支'] },
      { key: 'telco', name: '运营商', keywords: ['中国移动', '中国联通', '中国电信', '集采'] },
      { key: 'gov', name: '政企 / 政府 / 金融', keywords: ['政府', '政企', '金融', '智算中心', '算力券', '东数西算', '信创'] },
      { key: 'smb-consumer', name: '小 B / 个人', keywords: ['工作站', '桌面 AI', 'DGX Spark', 'Strix Halo', 'Ryzen AI Max', 'Mac Studio', 'M4 Ultra'] },
    ],
  },
  {
    id: 'other',
    name: '综合 / 其他',
    subCategories: [
      { key: 'other', name: '综合', keywords: [] },
    ],
  },
]

// 根据标题+摘要分派到产业链的 layer/sub。返回 {layer, sub, layerName, subName}
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
        }
      }
    }
  }
  return {
    layer: 'other',
    sub: 'other',
    layerName: '综合 / 其他',
    subName: '综合',
  }
}

// 根据分类推荐一个公众号 category（用于自动收录）
export function suggestAccountCategory(cls) {
  const map = {
    gpu: 'AI 芯片', cpu: '半导体', memory: '半导体', storage: '存储',
    pcb: '半导体', power: '散热/电源',
    oem: '服务器/存储', odm: '服务器/存储',
    hyperscaler: '互联网/云', telco: '运营商', gov: '政企/政府',
    'smb-consumer': '桌面 AI / 消费',
  }
  return map[cls.sub] || '综合'
}
