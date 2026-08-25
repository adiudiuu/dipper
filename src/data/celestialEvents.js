/**
 * 近期与历史重要天象（教学级近似日期，非精确预报）
 * 日期均为北京时间公历「示意日」，日月食时刻/可见范围以专业历表为准。
 */

/** @typedef {'lunar_eclipse'|'solar_eclipse'|'meteor_shower'|'planet_opposition'} CelestialEventType */

/**
 * @typedef {Object} CelestialEvent
 * @property {string} id
 * @property {CelestialEventType} type
 * @property {string} name
 * @property {number} y
 * @property {number} m
 * @property {number} d
 * @property {string} description
 * @property {boolean} [needsPrecisionHint] 日月食等需显著标注教学近似
 * @property {string} [precisionNote] 可选自定义精度说明
 */

/** @type {Record<CelestialEventType, { label: string, icon: string, precisionLevel: 'high'|'low', precisionNote?: string }>} */
export const EVENT_TYPES = {
  lunar_eclipse: {
    label: '月食',
    icon: '🌑',
    precisionLevel: 'high',
    precisionNote: '食甚时刻与可见范围仅为教学示意，请以天文历表为准。'
  },
  solar_eclipse: {
    label: '日食',
    icon: '🌒',
    precisionLevel: 'high',
    precisionNote: '食甚路径与本地能否看见需查精确历表，此处不作预报。'
  },
  meteor_shower: {
    label: '流星雨',
    icon: '☄',
    precisionLevel: 'low',
    precisionNote: '极大期日近似，受光害与天气影响大。'
  },
  planet_opposition: {
    label: '行星冲',
    icon: '♃',
    precisionLevel: 'low',
    precisionNote: '冲日附近数晚较亮，日期为示意。'
  }
}

/** @type {CelestialEvent[]} */
export const CELESTIAL_EVENTS = [
  {
    id: '2024-04-08-solar',
    type: 'solar_eclipse',
    name: '日全食',
    y: 2024,
    m: 4,
    d: 8,
    description: '2024 年最大日食，全食带横跨北美；东亚多为不可见或 partial，可对照轨道理解日月合朔。',
    needsPrecisionHint: true
  },
  {
    id: '2024-09-18-lunar',
    type: 'lunar_eclipse',
    name: '月偏食',
    y: 2024,
    m: 9,
    d: 18,
    description: '秋季月偏食，我国部分时段可见带食月出，适合理解地影锥与月相。',
    needsPrecisionHint: true
  },
  {
    id: '2025-03-14-lunar',
    type: 'lunar_eclipse',
    name: '月全食',
    y: 2025,
    m: 3,
    d: 14,
    description: '血月全食，东亚普遍可见，可观察月球进入本影时的变暗过程。',
    needsPrecisionHint: true
  },
  {
    id: '2025-09-07-lunar',
    type: 'lunar_eclipse',
    name: '月全食',
    y: 2025,
    m: 9,
    d: 7,
    description: '下半年月全食，适合与公历中秋附近对照理解「望」与食叠合。',
    needsPrecisionHint: true
  },
  {
    id: '2025-09-21-saturn',
    type: 'planet_opposition',
    name: '土星冲日',
    y: 2025,
    m: 9,
    d: 21,
    description: '土星整夜可见、亮度较佳，环状结构需小望远镜。',
    needsPrecisionHint: false
  },
  {
    id: '2026-03-03-lunar',
    type: 'lunar_eclipse',
    name: '月全食',
    y: 2026,
    m: 3,
    d: 3,
    description: '春季月全食，可对照历象侧栏月相条观察「满月中食」。',
    needsPrecisionHint: true
  },
  {
    id: '2026-08-12-perseids',
    type: 'meteor_shower',
    name: '英仙座流星雨极大',
    y: 2026,
    m: 8,
    d: 12,
    description: '北半球夏季经典流星雨，后半夜辐射点升高后观测条件较好。',
    needsPrecisionHint: false
  },
  {
    id: '2026-09-17-lunar',
    type: 'lunar_eclipse',
    name: '月偏食',
    y: 2026,
    m: 9,
    d: 17,
    description: '秋季月偏食，可理解半影/本影与月面明暗变化。',
    needsPrecisionHint: true
  },
  {
    id: '2026-12-14-geminids',
    type: 'meteor_shower',
    name: '双子座流星雨极大',
    y: 2026,
    m: 12,
    d: 14,
    description: '年末流量稳定、速度较慢的流星雨，适合初学者认辐射点。',
    needsPrecisionHint: false
  },
  {
    id: '2027-02-19-mars',
    type: 'planet_opposition',
    name: '火星冲日',
    y: 2027,
    m: 2,
    d: 19,
    description: '火星最亮观测季之一，整夜位于天球 opposite 太阳方向附近。',
    needsPrecisionHint: false
  },
  {
    id: '2027-02-20-solar',
    type: 'solar_eclipse',
    name: '日环食',
    y: 2027,
    m: 2,
    d: 20,
    description: '环食带主要经过南美/非洲南部，演示近地点月球视直径小于太阳时的环食。',
    needsPrecisionHint: true
  },
  {
    id: '2027-08-02-lunar',
    type: 'lunar_eclipse',
    name: '月全食',
    y: 2027,
    m: 8,
    d: 2,
    description: '夏季月全食，可结合轨道视图理解地月日近似一线。',
    needsPrecisionHint: true
  },
  {
    id: '2028-01-12-quadrantids',
    type: 'meteor_shower',
    name: '象限仪座流星雨极大',
    y: 2028,
    m: 1,
    d: 12,
    description: '新年伊始短峰值流星雨，峰值窄、需关注后半夜辐射高度。',
    needsPrecisionHint: false
  }
]
