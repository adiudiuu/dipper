import {
  beijingDayIndex,
  beijingNoonJD,
  findLunarForCivil,
  formatLunar,
  getJieqiContext,
  ymdFromDayIndex
} from './calendar.js'

/** 十二生肖（与地支序一致） */
export const SHENGXIAO_LIST = [
  { name: '鼠', zhi: '子', emoji: '鼠' },
  { name: '牛', zhi: '丑', emoji: '牛' },
  { name: '虎', zhi: '寅', emoji: '虎' },
  { name: '兔', zhi: '卯', emoji: '兔' },
  { name: '龙', zhi: '辰', emoji: '龙' },
  { name: '蛇', zhi: '巳', emoji: '蛇' },
  { name: '马', zhi: '午', emoji: '马' },
  { name: '羊', zhi: '未', emoji: '羊' },
  { name: '猴', zhi: '申', emoji: '猴' },
  { name: '鸡', zhi: '酉', emoji: '鸡' },
  { name: '狗', zhi: '戌', emoji: '狗' },
  { name: '猪', zhi: '亥', emoji: '猪' }
]

/** 农历固定节日（非闰月）。北小年腊月廿三、南小年腊月廿四 */
const LUNAR_FESTIVALS = [
  { month: 1, day: 1, name: '春节', tag: '岁首', group: '节日' },
  { month: 1, day: 15, name: '元宵节', tag: '上元', group: '节日' },
  { month: 2, day: 2, name: '龙抬头', tag: '春耕', group: '节日' },
  { month: 3, day: 3, name: '上巳节', tag: '踏青', group: '节日' },
  { month: 5, day: 5, name: '端午节', tag: '端阳', group: '节日' },
  { month: 7, day: 7, name: '七夕节', tag: '乞巧', group: '节日' },
  { month: 7, day: 15, name: '中元节', tag: '鬼节', group: '节日' },
  { month: 8, day: 15, name: '中秋节', tag: '月圆', group: '节日' },
  { month: 9, day: 9, name: '重阳节', tag: '登高', group: '节日' },
  { month: 10, day: 15, name: '下元节', tag: '祈福', group: '节日' },
  { month: 12, day: 8, name: '腊八节', tag: '腊祭', group: '年俗' },
  { month: 12, day: 23, name: '小年（北）', tag: '祭灶', group: '年俗' },
  { month: 12, day: 24, name: '小年（南）', tag: '祭灶', group: '年俗' }
]

/** 公历传统/民俗相关（含清明另由节气判定） */
const SOLAR_FESTIVALS = [
  { month: 1, day: 1, name: '元旦', tag: '新年' }
]

function ymdKey(y, m, d) {
  return y * 10000 + m * 100 + d
}

/**
 * 当日传统节日（农历 + 节气清明/冬至 + 除夕）
 */
export function getFestivalsOn(y, m, d) {
  const list = []
  const lunar = findLunarForCivil(y, m, d)
  const { month, day } = lunar

  if (!month.isLeap) {
    for (const f of LUNAR_FESTIVALS) {
      if (f.month === month.month && f.day === day) {
        list.push({
          name: f.name,
          tag: f.tag,
          kind: 'lunar',
          kindLabel: f.group || '节日'
        })
      }
    }
  }

  // 除夕：下一日为正月初一
  try {
    const nextIdx = beijingDayIndex(y, m, d) + 1
    const next = ymdFromDayIndex(nextIdx)
    const nextLunar = findLunarForCivil(next.y, next.m, next.d)
    if (nextLunar.month.month === 1 && !nextLunar.month.isLeap && nextLunar.day === 1) {
      list.push({ name: '除夕', tag: '岁除', kind: 'lunar', kindLabel: '年俗' })
    }
  } catch {
    /* ignore */
  }

  for (const f of SOLAR_FESTIVALS) {
    if (f.month === m && f.day === d) {
      list.push({ name: f.name, tag: f.tag, kind: 'solar', kindLabel: '公历' })
    }
  }

  const jd = beijingNoonJD(y, m, d)
  const jq = getJieqiContext(jd)
  // 节气当日（已过不足 1 天）视为节日日
  if (jq.daysInto >= 0 && jq.daysInto < 1) {
    if (jq.current.name === '清明') {
      list.push({ name: '清明节', tag: '踏青祭祖', kind: 'jieqi', kindLabel: '节气' })
    }
    if (jq.current.name === '冬至') {
      list.push({ name: '冬至', tag: '亚岁', kind: 'jieqi', kindLabel: '节气' })
    }
    if (jq.current.name === '立春') {
      list.push({ name: '立春', tag: '岁始', kind: 'jieqi', kindLabel: '节气' })
    }
  }

  // 去重
  const seen = new Set()
  return list.filter((item) => {
    if (seen.has(item.name)) return false
    seen.add(item.name)
    return true
  })
}

/** 单次会话向后扫描上限（约 3 年） */
export const FESTIVAL_MAX_SCAN_DAYS = 365 * 3

/**
 * 向后查找即将到来的传统节日（支持分页续查）
 * @param {number} y
 * @param {number} m
 * @param {number} d
 * @param {number} [limit=6]
 * @param {{ fromOffset?: number, maxOffset?: number, skipKeys?: Set<string>|string[] }} [opts]
 *   - fromOffset: 相对基准日起算的起始天数（含）
 *   - maxOffset: 扫描截止天数（含）
 *   - skipKeys: 已返回项的 `ymdKey:name`，同日多节续查时去重
 */
export function getUpcomingFestivals(y, m, d, limit = 6, opts = {}) {
  const fromOffset = Math.max(0, opts.fromOffset ?? 0)
  const maxOffset = opts.maxOffset ?? FESTIVAL_MAX_SCAN_DAYS
  const skipKeys = opts.skipKeys
    ? opts.skipKeys instanceof Set
      ? opts.skipKeys
      : new Set(opts.skipKeys)
    : null

  const start = beijingDayIndex(y, m, d)
  const out = []
  const seen = new Set()

  for (let i = fromOffset; i <= maxOffset && out.length < limit; i++) {
    const ymd = ymdFromDayIndex(start + i)
    const fest = getFestivalsOn(ymd.y, ymd.m, ymd.d)
    for (const f of fest) {
      const key = ymdKey(ymd.y, ymd.m, ymd.d) + ':' + f.name
      if (seen.has(key) || skipKeys?.has(key)) continue
      seen.add(key)
      let lunarText = ''
      try {
        lunarText = formatLunar(ymd.y, ymd.m, ymd.d).mdText
      } catch {
        /* 历法异常时仍返回节日，农历留空 */
      }
      out.push({
        ...f,
        y: ymd.y,
        m: ymd.m,
        d: ymd.d,
        daysLater: i,
        dateText: `${ymd.y}-${String(ymd.m).padStart(2, '0')}-${String(ymd.d).padStart(2, '0')}`,
        lunarText,
        key
      })
      if (out.length >= limit) break
    }
  }
  return out
}

export function shengxiaoIndex(name) {
  return SHENGXIAO_LIST.findIndex((s) => s.name === name)
}
