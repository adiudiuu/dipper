/**
 * calendar.js 回归抽样
 *
 * 样本来源（常用公开历表，教学算法允许与官方定气/朔时刻有亚日级偏差）：
 * - 农历正月初一 / 闰月：中国科学院紫金山天文台历表口径（常见公开对照，如
 *   https://www.weather.com.cn/life/calendar.shtml 及同类农历表）
 * - 节气公历日：气象台 / 历书常见「某节气落在何日」表（定气，北京时间）
 * - 干支日柱：六十甲子日序常见对照（儒略日正午序）
 * - 年柱换年：本站口径为农历正月朔（非立春），与生肖换年一致
 */
import { describe, expect, it } from 'vitest'
import {
  beijingNoonJD,
  findLunarForCivil,
  formatLunar,
  getJieqiContext,
  resolveGanzhi,
  ymdFromDayIndex,
  beijingDayIndex
} from './calendar.js'

/** 节气日：正午 JD 下「当前或即将到来」含目标名（定气时刻可能偏下午） */
function jieqiNear(y, m, d, name) {
  const jd = beijingNoonJD(y, m, d)
  const ctx = getJieqiContext(jd)
  const names = [ctx.current?.name, ctx.next?.name]
  expect(names, `${y}-${m}-${d} 期望近 ${name}`).toContain(name)
}

describe('calendar · 朔日 / 正月初一', () => {
  it.each([
    // 春节 = 正月初一
    [2024, 2, 10, '甲辰', false],
    [2023, 1, 22, '癸卯', false],
    [2025, 1, 29, '乙巳', false],
    [2012, 1, 23, '壬辰', false],
    [2001, 1, 24, '辛巳', false]
  ])('%i-%i-%i 正月初一 年柱 %s', (y, m, d, yearGz, leap) => {
    const L = formatLunar(y, m, d)
    expect(L.isLeapMonth).toBe(leap)
    expect(L.month.month).toBe(1)
    expect(L.day).toBe(1)
    expect(L.ganzhi.pillars.year.text).toBe(yearGz)
    expect(L.mdText).toMatch(/^正月初一$/)
  })
})

describe('calendar · 闰月年', () => {
  it('2020 闰四月初一', () => {
    const L = formatLunar(2020, 5, 23)
    expect(L.isLeapMonth).toBe(true)
    expect(L.month.month).toBe(4)
    expect(L.day).toBe(1)
    expect(L.mdText).toBe('闰四月初一')
  })

  it('2020 四月初一（正四月，非闰）', () => {
    const L = formatLunar(2020, 4, 23)
    expect(L.isLeapMonth).toBe(false)
    expect(L.month.month).toBe(4)
    expect(L.day).toBe(1)
  })

  it('2023 闰二月（清明前后）', () => {
    const L = formatLunar(2023, 4, 5)
    expect(L.isLeapMonth).toBe(true)
    expect(L.month.month).toBe(2)
  })
})

describe('calendar · 节气日（抽样）', () => {
  it('春分 2024-03-20', () => jieqiNear(2024, 3, 20, '春分'))
  it('夏至 2024-06-21', () => jieqiNear(2024, 6, 21, '夏至'))
  it('秋分 2024-09-22', () => jieqiNear(2024, 9, 22, '秋分'))
  it('冬至 2024-12-21', () => jieqiNear(2024, 12, 21, '冬至'))
  it('立春 2024-02-04', () => jieqiNear(2024, 2, 4, '立春'))
  it('清明 2023-04-05', () => jieqiNear(2023, 4, 5, '清明'))
})

describe('calendar · 干支日柱', () => {
  it.each([
    // 日柱抽样：与常见六十甲子历日对照
    [2024, 2, 10, '甲辰'],
    [2024, 2, 9, '癸卯'],
    [2023, 1, 22, '庚辰'],
    [2000, 1, 1, '戊午']
  ])('%i-%i-%i 日柱 %s', (y, m, d, dayGz) => {
    expect(resolveGanzhi(y, m, d).pillars.day.text).toBe(dayGz)
  })
})

describe('calendar · 年柱换年边界（正月朔）', () => {
  it('2024：腊月三十仍癸卯，正月初一改甲辰', () => {
    const before = resolveGanzhi(2024, 2, 9)
    const after = resolveGanzhi(2024, 2, 10)
    expect(before.pillars.year.text).toBe('癸卯')
    expect(formatLunar(2024, 2, 9).mdText).toBe('腊月三十')
    expect(after.pillars.year.text).toBe('甲辰')
    expect(formatLunar(2024, 2, 10).mdText).toBe('正月初一')
  })

  it('立春不单独换年柱（2024-02-04 仍癸卯）', () => {
    // 立春在正月朔之前；年柱仍随农历岁首
    expect(resolveGanzhi(2024, 2, 4).pillars.year.text).toBe('癸卯')
  })
})

describe('calendar · 朔日索引一致性', () => {
  it('正月初一的 findLunar 与 formatLunar 一致', () => {
    const { month, day } = findLunarForCivil(2024, 2, 10)
    expect(month.month).toBe(1)
    expect(month.isLeap).toBe(false)
    expect(day).toBe(1)
    const shuoYmd = ymdFromDayIndex(month.shuoDay)
    expect(shuoYmd).toEqual({ y: 2024, m: 2, d: 10 })
    expect(beijingDayIndex(2024, 2, 10)).toBe(month.shuoDay)
  })
})
