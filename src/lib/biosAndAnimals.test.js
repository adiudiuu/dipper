/**
 * 明星小传 + 四象拆解 · 数据完整性回归
 * 校验：小传 highlight 名、四象七宿名都能解析到真实东象星官；二十八宿无重复无遗漏。
 */
import { describe, expect, it } from 'vitest'
import { STAR_BIOS } from './starBiographies.js'
import { FOUR_ANIMALS } from './fourAnimals.js'
import {
  CONSTELLATIONS,
  ensureExtraAsterisms,
  getConstellationByName
} from './sky.js'

const EAST_NAMES = new Set(
  CONSTELLATIONS.filter((c) => c.layer === 'east').map((c) => c.name)
)

describe('明星小传 · 数据完整性', () => {
  it('至少含本批 4 篇', () => {
    expect(STAR_BIOS.length).toBeGreaterThanOrEqual(4)
  })

  it('字段齐全（title/tagline/body/highlight）', () => {
    STAR_BIOS.forEach((bio) => {
      expect(bio.title, bio.id).toBeTruthy()
      expect(bio.tagline, bio.id).toBeTruthy()
      expect(bio.body, bio.id).toBeTruthy()
      expect(bio.highlight?.length, bio.id).toBeGreaterThan(0)
    })
  })

  it('每篇 highlight 都能解析到东象星官（含动态附属星官）', async () => {
    await ensureExtraAsterisms()
    STAR_BIOS.forEach((bio) => {
      bio.highlight.forEach((n) => {
        const c = getConstellationByName(n)
        expect(c, `${bio.id} → ${n}`).not.toBeNull()
        expect(c.layer, `${bio.id} → ${n}`).toBe('east')
      })
    })
  })
})

describe('四象拆解 · 数据完整性', () => {
  it('四象齐备，每象七宿', () => {
    expect(FOUR_ANIMALS.length).toBe(4)
    FOUR_ANIMALS.forEach((a) => {
      expect(a.mansions?.length, a.name).toBe(7)
      expect(a.color, a.name).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it('与 constellationCulture 有文化文案的宿保持一致（口径内核）', () => {
    for (const a of FOUR_ANIMALS) {
      for (const m of a.mansions) {
        const c = getConstellationByName(m.name)
        expect(c, `${a.name} → ${m.name}`).not.toBeNull()
      }
    }
  })

  it('二十八宿无重复、无遗漏（并集恰为 28）', () => {
    const all = FOUR_ANIMALS.flatMap((a) => a.mansions.map((m) => m.name))
    expect(all.length).toBe(28)
    expect(new Set(all).size).toBe(28)
    // 全部落在东象 core 集合里
    all.forEach((n) => expect(EAST_NAMES.has(n), n).toBe(true))
  })
})