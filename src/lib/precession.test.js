/**
 * precession.js 回归抽样（教学示意口径）
 * 核心校准点：北天极 = 绕固定北黄极轴旋转 J2000 天极点；-2800 年应精确落在右枢附近。
 */
import { describe, expect, it } from 'vitest'
import {
  POLE_STARS,
  accumulatedPrecessionDeg,
  northCelestialPoleYear,
  rotateAboutPole,
  winterSolsticePointYear,
  nearestPoleStar,
  meanObliquityDeg
} from './precession.js'

const STAR_OF = Object.fromEntries(POLE_STARS.map((s) => [s.name, s]))

/** {ra,dec} 角距离（度） */
function sepDeg(a, b) {
  const toRad = Math.PI / 180
  const d =
    Math.cos(a.dec * toRad) * Math.cos(b.dec * toRad) * Math.cos((a.ra - b.ra) * 15 * toRad) +
    Math.sin(a.dec * toRad) * Math.sin(b.dec * toRad)
  return Math.acos(Math.max(-1, Math.min(1, d))) / toRad
}

describe('precession · 累计进动角', () => {
  it('J2000（2000 年）为零', () => {
    expect(accumulatedPrecessionDeg(2000)).toBeCloseTo(0, 10)
  })

  it('过去为负、未来为正，且单调', () => {
    const past = accumulatedPrecessionDeg(-2000)
    const now = accumulatedPrecessionDeg(2026)
    const future = accumulatedPrecessionDeg(2100)
    expect(past).toBeLessThan(0)
    expect(now).toBeGreaterThan(0)
    expect(now).toBeLessThan(future)
  })

  it('百年约 1.397°（≈50.29″/年）', () => {
    expect(accumulatedPrecessionDeg(2100)).toBeCloseTo(1.397, 2)
  })
})

describe('precession · 黄赤交角', () => {
  it('J2000 ≈ 23.439°', () => {
    expect(meanObliquityDeg(2000)).toBeCloseTo(23.43929111, 5)
  })
})

describe('precession · 北天极位置', () => {
  it('2000 年在 J2000 天极（0h, +90°）', () => {
    const p = northCelestialPoleYear(2000)
    expect(p.dec).toBeCloseTo(90, 6)
  })

  it('-2800 年前后落在右枢（核心校准点）', () => {
    const p = northCelestialPoleYear(-2800)
    expect(sepDeg(p, STAR_OF['右枢'])).toBeLessThan(1.2)
  })

  it('2100 年仍在勾陈一 2° 内', () => {
    const p = northCelestialPoleYear(2100)
    expect(sepDeg(p, STAR_OF['勾陈一'])).toBeLessThan(2.5)
  })
})

describe('precession · 冬至点（恒星参照）', () => {
  it('2000 年在 RA 18h / Dec −黄赤交角', () => {
    const w = winterSolsticePointYear(2000)
    expect(w.ra).toBeCloseTo(18, 1)
    expect(w.dec).toBeCloseTo(-23.44, 1)
  })

  it('2000→2100 沿黄道漂移 ≈1.4°（≈50″/年，即约 71 年西移 1°）', () => {
    const a = winterSolsticePointYear(2000)
    const b = winterSolsticePointYear(2100)
    const d = sepDeg(a, b)
    expect(d).toBeGreaterThan(1.3)
    expect(d).toBeLessThan(1.5)
  })
})

describe('precession · 极星更替', () => {
  it('现代（2000）为勾陈一', () => {
    expect(nearestPoleStar(2000)?.name).toBe('勾陈一')
  })

  it('-2800 为右枢', () => {
    expect(nearestPoleStar(-2800)?.name).toBe('右枢')
  })

  it('滑杆中段空窗期（两亮星之间）返回 null', () => {
    expect(nearestPoleStar(-1500)).toBeNull()
  })
})

describe('precession · rotateAboutPole', () => {
  it('保单位长度', () => {
    const v = rotateAboutPole([0.6, 0.8, 0], 0.7)
    expect(Math.hypot(...v)).toBeCloseTo(1, 9)
  })

  it('J2000（θ=0）时天极方向不变', () => {
    const v = rotateAboutPole([0, 1, 0], 0)
    expect(v[1]).toBeCloseTo(1, 9)
    expect(Math.hypot(v[0], v[2])).toBeCloseTo(0, 9)
  })
})