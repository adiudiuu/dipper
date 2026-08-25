import { describe, expect, it } from 'vitest'
import { CELESTIAL_EVENTS } from '../data/celestialEvents.js'
import {
  daysUntilEvent,
  enrichEvent,
  formatEventDate,
  getEventsOn,
  getEventsSorted,
  parseDateQuery
} from './celestialEvents.js'

describe('celestialEvents · 数据与工具', () => {
  it('至少 8 条天象记录', () => {
    expect(CELESTIAL_EVENTS.length).toBeGreaterThanOrEqual(8)
  })

  it('按日期排序', () => {
    const sorted = getEventsSorted()
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1]
      const cur = sorted[i]
      const pk = prev.y * 10000 + prev.m * 100 + prev.d
      const ck = cur.y * 10000 + cur.m * 100 + cur.d
      expect(ck).toBeGreaterThanOrEqual(pk)
    }
  })

  it('formatEventDate 补零', () => {
    expect(formatEventDate({ y: 2026, m: 3, d: 3 })).toBe('2026-03-03')
  })

  it('daysUntilEvent 相对 panel 日', () => {
    const ev = CELESTIAL_EVENTS.find((e) => e.id === '2026-03-03-lunar')
    expect(ev).toBeTruthy()
    expect(daysUntilEvent(ev, 2026, 3, 1)).toBe(2)
    expect(daysUntilEvent(ev, 2026, 3, 3)).toBe(0)
    expect(daysUntilEvent(ev, 2026, 3, 10)).toBe(-7)
  })

  it('getEventsOn 命中当日', () => {
    const onDay = getEventsOn(2026, 3, 3)
    expect(onDay.some((e) => e.id === '2026-03-03-lunar')).toBe(true)
  })

  it('enrichEvent 标记高精度提示', () => {
    const ev = CELESTIAL_EVENTS.find((e) => e.id === '2026-03-03-lunar')
    const row = enrichEvent(ev, 2026, 8, 25)
    expect(row.precisionLevel).toBe('high')
    expect(row.typeLabel).toBe('月食')
    expect(row.daysLater).toBeLessThan(0)
  })

  it('parseDateQuery 合法/非法', () => {
    expect(parseDateQuery('2026-04-08')).toEqual({ y: 2026, m: 4, d: 8 })
    expect(parseDateQuery('bad')).toBeNull()
    expect(parseDateQuery('2026-13-01')).toBeNull()
  })
})
