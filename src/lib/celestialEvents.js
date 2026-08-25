import { CELESTIAL_EVENTS, EVENT_TYPES } from '../data/celestialEvents.js'
import { beijingDayIndex } from './calendar.js'

export function eventDateKey(ev) {
  return ev.y * 10000 + ev.m * 100 + ev.d
}

export function formatEventDate(ev) {
  return `${ev.y}-${String(ev.m).padStart(2, '0')}-${String(ev.d).padStart(2, '0')}`
}

export function getEventsSorted() {
  return [...CELESTIAL_EVENTS].sort((a, b) => eventDateKey(a) - eventDateKey(b))
}

export function daysUntilEvent(ev, fromY, fromM, fromD) {
  return beijingDayIndex(ev.y, ev.m, ev.d) - beijingDayIndex(fromY, fromM, fromD)
}

export function getEventsOn(y, m, d) {
  return CELESTIAL_EVENTS.filter((ev) => ev.y === y && ev.m === m && ev.d === d)
}

/**
 * @param {import('../data/celestialEvents.js').CelestialEvent} ev
 */
export function enrichEvent(ev, fromY, fromM, fromD) {
  const typeMeta = EVENT_TYPES[ev.type] || {}
  const daysLater = daysUntilEvent(ev, fromY, fromM, fromD)
  const precisionLevel =
    ev.needsPrecisionHint || typeMeta.precisionLevel === 'high' ? 'high' : 'low'

  return {
    ...ev,
    daysLater,
    dateText: formatEventDate(ev),
    typeLabel: typeMeta.label || ev.type,
    kind: ev.type,
    icon: typeMeta.icon || '✦',
    precisionLevel,
    precisionNote: ev.precisionNote || typeMeta.precisionNote || ''
  }
}

export function getCelestialEventsForList(fromY, fromM, fromD) {
  return getEventsSorted().map((ev) => enrichEvent(ev, fromY, fromM, fromD))
}

export function parseDateQuery(raw) {
  if (typeof raw !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return { y, m: mo, d }
}
