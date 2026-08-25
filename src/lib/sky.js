/**
 * 星空 / 行星 / 星座数据与生成
 *
 * 约定：轨道半径为教学压缩尺度（地球≈16）；方位角（日心黄经、赤经赤纬投影）按天文近似，
 * 与历法 JD 联动，不使用随意相位。
 */
import * as THREE from 'three'
import { CONSTELLATION_CULTURE } from './constellationCulture.js'
import { WEST_CONSTELLATION_TIPS } from './westConstellationTips.js'
import { getBuTianGeNoteForAsterism } from './buTianGe.js'

/** 赤经(时) 赤纬(°) → 天球坐标 */
export function raDecToVec(raHours, decDeg, radius) {
  const ra = (raHours * 15 * Math.PI) / 180
  const dec = (decDeg * Math.PI) / 180
  return new THREE.Vector3(
    radius * Math.cos(dec) * Math.cos(ra),
    radius * Math.sin(dec),
    radius * Math.cos(dec) * Math.sin(ra)
  )
}

/**
 * 星座 / 星官示意（赤经时、赤纬度，便于同屏辨认）
 * layer: 'west' 西象 | 'east' 古象
 * tier: 'major'|'minor'（西）| 'core'|'extra'（古）；minor / label:false 默认不贴名
 * label: false 强制不显示名称
 * culture?: { origin?, myth?, modernRef? } 星官故事（教学向）
 * stars: [raHours, decDeg, size?]
 * lines: 星点下标连线
 *
 * 古象·纲 = core（三垣简化 + 二十八宿 + 北斗）
 * 古象·繁 = core + EAST_EXTRA_ASTERISMS（约 283 官，陈卓体系全表量级示意）
 */
export const CONSTELLATIONS = [
  // —— 西象：IAU 88 示意折线；tier major 贴名，minor 默认无标签以控遮挡 ——
  // —— 古象 core：三垣·二十八宿·北斗；extra 见文末展开 ——
  {
    name: '大熊',
    layer: 'west',
    tier: 'major',
    color: 0xd8c8a8,
    stars: [[11.06, 61.75, 1.1], [11.03, 56.38, 1.05], [10.28, 42.91, 1.15], [9.55, 51.68, 1.2], [8.5, 60.72, 1.1], [11.9, 53.69, 1]],
    lines: [[0, 1], [1, 5], [1, 2], [2, 3], [3, 4], [4, 0]],
    labelAt: 3
  },
  {
    name: '小熊',
    layer: 'west',
    tier: 'major',
    color: 0xe8f0ff,
    stars: [[2.53, 89.26, 1.7], [17.53, 86.59, 1.15], [16.77, 82.04, 1.1], [15.35, 71.83, 1.25], [14.85, 74.16, 1.1], [15.73, 77.79, 1.05], [16.29, 75.75, 1]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
    labelAt: 0
  },
  {
    name: '猎户',
    layer: 'west',
    tier: 'major',
    color: 0xa8c8e0,
    stars: [[5.92, 7.41, 1.65], [5.42, 6.35, 1.4], [5.68, -1.94, 1.25], [5.6, -1.2, 1.4], [5.53, -0.3, 1.25], [5.8, -9.67, 1.3], [5.24, -8.2, 1.6]],
    lines: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]],
    labelAt: 3
  },
  {
    name: '仙后',
    layer: 'west',
    tier: 'major',
    color: 0xd8c4a8,
    stars: [[0.67, 56.54, 1.25], [0.15, 59.15, 1.2], [0.95, 60.72, 1.3], [1.43, 60.24, 1.15], [1.91, 63.67, 1.2]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    labelAt: 2
  },
  {
    name: '天鹅',
    layer: 'west',
    tier: 'major',
    color: 0xc0d4e8,
    stars: [[20.69, 45.28, 1.55], [20.37, 40.26, 1.25], [19.75, 45.13, 1.2], [20.77, 33.97, 1.35], [21.22, 30.23, 1.2], [19.49, 27.96, 1.25]],
    lines: [[0, 1], [0, 2], [0, 3], [3, 4], [1, 5]],
    labelAt: 0
  },
  {
    name: '天琴',
    layer: 'west',
    tier: 'major',
    color: 0xe8e0ff,
    stars: [[18.62, 38.78, 1.75], [18.98, 32.69, 1.15], [18.33, 36.9, 1.1], [18.74, 37.6, 1.05]],
    lines: [[0, 1], [0, 2], [0, 3], [2, 3]],
    labelAt: 0
  },
  {
    name: '天鹰',
    layer: 'west',
    tier: 'major',
    color: 0xf0d8c0,
    stars: [[19.85, 8.87, 1.7], [19.42, 3.11, 1.2], [19.1, 13.86, 1.25], [20.19, -0.82, 1.1]],
    lines: [[2, 0], [0, 1], [1, 3]],
    labelAt: 0
  },
  {
    name: '南十字',
    layer: 'west',
    tier: 'major',
    color: 0xc0e0f0,
    stars: [[12.44, -63.1, 1.55], [12.8, -59.69, 1.4], [12.25, -58.75, 1.35], [12.5, -57.11, 1.3]],
    lines: [[0, 1], [2, 3]],
    labelAt: 1
  },
  {
    name: '飞马',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8e0,
    stars: [[23.08, 15.21, 1.45], [0.14, 15.18, 1.4], [0.22, 29.05, 1.35], [22.72, 30.22, 1.3], [22.83, 24.6, 1.15]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4]],
    labelAt: 2
  },
  {
    name: '白羊',
    layer: 'west',
    tier: 'major',
    color: 0xe0c8b0,
    stars: [[2.12, 23.46, 1.55], [1.91, 20.81, 1.3], [1.91, 19.29, 1.15], [2.83, 27.26, 1.2]],
    lines: [[1, 0], [0, 2], [0, 3]],
    labelAt: 0
  },
  {
    name: '金牛',
    layer: 'west',
    tier: 'major',
    color: 0xe8c4a0,
    stars: [[4.6, 16.51, 1.7], [4.48, 19.18, 1.2], [4.28, 15.63, 1.15], [5.44, 28.61, 1.35], [3.79, 24.14, 1.25]],
    lines: [[2, 0], [0, 1], [0, 3], [1, 4]],
    labelAt: 0
  },
  {
    name: '双子',
    layer: 'west',
    tier: 'major',
    color: 0xb8d0e0,
    stars: [[7.76, 28.03, 1.5], [7.58, 31.89, 1.45], [6.63, 16.4, 1.2], [6.38, 22.51, 1.15], [7.07, 20.57, 1.1], [7.8, 24.4, 1.05]],
    lines: [[0, 1], [1, 3], [3, 2], [0, 5], [5, 4], [4, 2]],
    labelAt: 0
  },
  {
    name: '巨蟹',
    layer: 'west',
    tier: 'major',
    color: 0xc8d8e0,
    stars: [[8.74, 18.15, 1.35], [8.72, 21.47, 1.25], [8.97, 11.86, 1.3], [8.27, 9.19, 1.2], [8.78, 28.77, 1.15]],
    lines: [[1, 0], [0, 2], [2, 3], [0, 4]],
    labelAt: 0
  },
  {
    name: '狮子',
    layer: 'west',
    tier: 'major',
    color: 0xe8c898,
    stars: [[10.14, 11.97, 1.65], [10.28, 19.84, 1.3], [11.24, 15.43, 1.25], [11.8, 14.57, 1.35], [9.76, 23.77, 1.2], [10.33, 9.9, 1.15]],
    lines: [[4, 1], [1, 0], [0, 5], [0, 2], [2, 3]],
    labelAt: 0
  },
  {
    name: '处女',
    layer: 'west',
    tier: 'major',
    color: 0xc8d8c0,
    stars: [[13.42, -11.16, 1.7], [13.04, 10.96, 1.25], [12.93, 3.4, 1.15], [14.21, -8.66, 1.2], [13.58, -0.6, 1.1]],
    lines: [[1, 2], [2, 4], [4, 0], [0, 3]],
    labelAt: 0
  },
  {
    name: '天秤',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8b8,
    stars: [[15.28, -9.38, 1.45], [14.85, -16.04, 1.4], [15.06, -25.28, 1.2], [15.59, -14.79, 1.15]],
    lines: [[1, 0], [0, 3], [1, 2]],
    labelAt: 0
  },
  {
    name: '天蝎',
    layer: 'west',
    tier: 'major',
    color: 0xe0a090,
    stars: [[16.49, -26.43, 1.7], [16.35, -25.59, 1.15], [16.6, -28.22, 1.15], [16.86, -34.29, 1.25], [17.2, -43, 1.2], [17.62, -37.3, 1.25], [17.79, -40.13, 1.2]],
    lines: [[1, 0], [0, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    labelAt: 0
  },
  {
    name: '射手',
    layer: 'west',
    tier: 'major',
    color: 0xd4b898,
    stars: [[18.4, -34.38, 1.35], [18.1, -30.42, 1.25], [18.35, -29.83, 1.3], [18.76, -26.3, 1.35], [19.06, -27.67, 1.2], [19.16, -21.06, 1.25], [18.28, -36.76, 1.2]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [0, 6]],
    labelAt: 3
  },
  {
    name: '摩羯',
    layer: 'west',
    tier: 'major',
    color: 0xc8c0b0,
    stars: [[21.79, -16.13, 1.45], [20.35, -14.78, 1.35], [21.47, -22.41, 1.25], [20.31, -12.51, 1.15], [21.37, -17.23, 1.2]],
    lines: [[1, 3], [1, 0], [0, 4], [0, 2]],
    labelAt: 0
  },
  {
    name: '水瓶',
    layer: 'west',
    tier: 'major',
    color: 0xb8d0e4,
    stars: [[22.1, -0.32, 1.5], [21.53, -5.57, 1.4], [22.36, -1.39, 1.25], [22.48, -0.02, 1.2], [22.91, -15.82, 1.25]],
    lines: [[1, 0], [0, 2], [2, 3], [0, 4]],
    labelAt: 0
  },
  {
    name: '双鱼',
    layer: 'west',
    tier: 'major',
    color: 0xc8d0d8,
    stars: [[1.52, 15.35, 1.35], [2.03, 2.76, 1.25], [23.29, 3.28, 1.2], [23.46, 6.14, 1.15], [23.67, 5.63, 1.15], [23.99, 6.86, 1.1]],
    lines: [[2, 3], [3, 4], [4, 5], [5, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '仙女',
    layer: 'west',
    tier: 'major',
    color: 0xd0c0d8,
    stars: [[0.14, 29.09, 1.45], [0.66, 30.86, 1.25], [1.16, 35.62, 1.35], [2.06, 42.33, 1.5]],
    lines: [[0, 1], [1, 2], [2, 3]],
    labelAt: 3
  },
  {
    name: '御夫',
    layer: 'west',
    tier: 'major',
    color: 0xe8d0a8,
    stars: [[5.28, 45.99, 1.7], [5, 43.82, 1.25], [5.99, 44.95, 1.2], [4.95, 33.16, 1.15], [5.99, 37.29, 1.1]],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
    labelAt: 0
  },
  {
    name: '牧夫',
    layer: 'west',
    tier: 'major',
    color: 0xe0c898,
    stars: [[14.26, 19.18, 1.7], [14.75, 27.07, 1.25], [13.91, 18.4, 1.15], [15.26, 33.31, 1.2], [14.53, 38.31, 1.15]],
    lines: [[2, 0], [0, 1], [1, 3], [3, 4]],
    labelAt: 0
  },
  {
    name: '大犬',
    layer: 'west',
    tier: 'major',
    color: 0xc8d8e8,
    stars: [[6.75, -16.72, 1.8], [6.38, -17.96, 1.25], [7.04, -23.83, 1.35], [7.24, -26.39, 1.2], [6.98, -28.97, 1.15]],
    lines: [[0, 1], [0, 2], [2, 3], [3, 4]],
    labelAt: 0
  },
  {
    name: '小犬',
    layer: 'west',
    tier: 'major',
    color: 0xd0d8e0,
    stars: [[7.66, 5.23, 1.55], [7.45, 8.29, 1.2]],
    lines: [[0, 1]],
    labelAt: 0
  },
  {
    name: '船底',
    layer: 'west',
    tier: 'major',
    color: 0xb8d0e0,
    stars: [[6.4, -52.7, 1.75], [9.22, -69.72, 1.35], [10.72, -64.39, 1.2], [8.37, -59.51, 1.15]],
    lines: [[0, 3], [3, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '半人马',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8b0,
    stars: [[14.66, -60.83, 1.7], [14.11, -36.37, 1.35], [13.66, -53.47, 1.25], [14.99, -42.1, 1.2], [12.46, -50.16, 1.15]],
    lines: [[1, 3], [3, 0], [0, 2], [2, 4]],
    labelAt: 0
  },
  {
    name: '仙王',
    layer: 'west',
    tier: 'major',
    color: 0xd8c8c0,
    stars: [[21.31, 62.59, 1.35], [22.18, 58.2, 1.25], [20.31, 62.99, 1.2], [20.75, 61.84, 1.15], [23.66, 77.63, 1.3]],
    lines: [[2, 3], [3, 0], [0, 1], [0, 4]],
    labelAt: 0
  },
  {
    name: '鲸鱼',
    layer: 'west',
    tier: 'major',
    color: 0xb8c8d0,
    stars: [[3.04, 4.09, 1.45], [2.72, 3.24, 1.2], [1.73, -15.94, 1.35], [0.73, -17.68, 1.25], [2, -7.67, 1.15]],
    lines: [[1, 0], [0, 4], [4, 2], [2, 3]],
    labelAt: 0
  },
  {
    name: '北冕',
    layer: 'west',
    tier: 'major',
    color: 0xe0d0b8,
    stars: [[15.58, 26.71, 1.4], [15.46, 29.11, 1.15], [15.71, 31.36, 1.1], [16.24, 33.96, 1.15], [15.81, 26.3, 1.1]],
    lines: [[0, 1], [1, 2], [2, 3], [0, 4]],
    labelAt: 0
  },
  {
    name: '乌鸦',
    layer: 'west',
    tier: 'major',
    color: 0xc0c8c8,
    stars: [[12.56, -16.52, 1.3], [12.5, -23.4, 1.25], [12.25, -17.54, 1.2], [12.17, -22.62, 1.15]],
    lines: [[2, 0], [0, 1], [1, 3], [3, 2]],
    labelAt: 0
  },
  {
    name: '海豚',
    layer: 'west',
    tier: 'major',
    color: 0xc8d4e0,
    stars: [[20.66, 15.91, 1.3], [20.61, 14.6, 1.15], [20.58, 11.3, 1.2], [20.68, 16.12, 1.1]],
    lines: [[0, 1], [1, 2], [0, 3], [3, 1]],
    labelAt: 0
  },
  {
    name: '天龙',
    layer: 'west',
    tier: 'major',
    color: 0xb8c8d8,
    stars: [[17.94, 51.49, 1.35], [17.53, 52.3, 1.2], [16.4, 61.51, 1.25], [15.42, 58.85, 1.15], [14.07, 64.38, 1.2], [11.9, 69.33, 1.15], [9.51, 81.12, 1.25]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    labelAt: 0
  },
  {
    name: '波江',
    layer: 'west',
    tier: 'major',
    color: 0xa8c8d8,
    stars: [[5.13, -5.09, 1.4], [3.97, -13.51, 1.2], [2.97, -40.3, 1.25], [1.63, -57.24, 1.45]],
    lines: [[0, 1], [1, 2], [2, 3]],
    labelAt: 0
  },
  {
    name: '武仙',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8b8,
    stars: [[17.25, 14.39, 1.35], [16.72, 31.6, 1.25], [16.5, 21.49, 1.2], [17.77, 27.72, 1.15], [17.58, 37.25, 1.2]],
    lines: [[2, 0], [0, 3], [3, 1], [1, 4], [3, 4]],
    labelAt: 0
  },
  {
    name: '长蛇',
    layer: 'west',
    tier: 'major',
    color: 0xb0c8b0,
    stars: [[8.78, 6.42, 1.35], [9.46, -8.66, 1.3], [10.83, -16.2, 1.2], [11.88, -33.91, 1.15], [13.32, -23.17, 1.25], [14.85, -16.04, 1.2]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    labelAt: 0
  },
  {
    name: '天兔',
    layer: 'west',
    tier: 'major',
    color: 0xc8d0d0,
    stars: [[5.55, -17.82, 1.35], [5.22, -16.21, 1.2], [5.05, -22.37, 1.15], [5.78, -20.76, 1.2]],
    lines: [[1, 0], [0, 3], [3, 2], [2, 1]],
    labelAt: 0
  },
  {
    name: '蛇夫',
    layer: 'west',
    tier: 'major',
    color: 0xd0c0a8,
    stars: [[17.58, 12.56, 1.4], [16.48, -10.57, 1.25], [17.72, 4.57, 1.2], [16.37, -4.69, 1.15], [17.18, -15.72, 1.2]],
    lines: [[1, 3], [3, 0], [0, 2], [3, 4]],
    labelAt: 0
  },
  {
    name: '英仙',
    layer: 'west',
    tier: 'major',
    color: 0xd8c4b0,
    stars: [[3.41, 49.86, 1.45], [3.16, 40.96, 1.3], [3.08, 53.51, 1.2], [2.84, 55.9, 1.15], [3.98, 40.01, 1.25]],
    lines: [[3, 2], [2, 0], [0, 1], [1, 4]],
    labelAt: 0
  },
  {
    name: '南鱼',
    layer: 'west',
    tier: 'major',
    color: 0xb8d0e0,
    stars: [[22.96, -29.62, 1.65], [22.7, -32.35, 1.15], [22.42, -28.45, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '三角',
    layer: 'west',
    tier: 'major',
    color: 0xc8c8d0,
    stars: [[2.19, 34.99, 1.25], [1.89, 29.58, 1.15], [2.28, 33.85, 1.1]],
    lines: [[0, 1], [1, 2], [2, 0]],
    labelAt: 0
  },
  {
    name: '后发',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8c0,
    stars: [[13.2, 17.46, 1.2], [13, 27.88, 1.15], [12.45, 28.27, 1.1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '猎犬',
    layer: 'west',
    tier: 'major',
    color: 0xc8c0b8,
    stars: [[12.93, 38.32, 1.35], [12.56, 41.36, 1.2]],
    lines: [[0, 1]],
    labelAt: 0
  },
  {
    name: '天鸽',
    layer: 'west',
    tier: 'major',
    color: 0xc0d0d8,
    stars: [[5.66, -34.07, 1.3], [5.85, -35.55, 1.15], [6.38, -33.43, 1.1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '天箭',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8b0,
    stars: [[19.65, 17.48, 1.2], [19.81, 18.53, 1.15], [19.98, 19.01, 1.1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '麒麟',
    layer: 'west',
    tier: 'major',
    color: 0xb8c8d0,
    stars: [[7.2, -0.49, 1.2], [6.68, -5.45, 1.1], [6.25, 4.59, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '船尾',
    layer: 'west',
    tier: 'major',
    color: 0xb0c8d0,
    stars: [[8.13, -24.3, 1.35], [7.49, -43.3, 1.25], [6.83, -50.61, 1.2], [8.25, -44.46, 1.15]],
    lines: [[0, 1], [1, 2], [1, 3]],
    labelAt: 0
  },
  {
    name: '船帆',
    layer: 'west',
    tier: 'major',
    color: 0xb8d0d8,
    stars: [[9.13, -43.43, 1.35], [8.16, -47.34, 1.25], [9.37, -55.01, 1.2], [10.78, -49.35, 1.15]],
    lines: [[1, 0], [0, 3], [0, 2]],
    labelAt: 0
  },
  {
    name: '天鹤',
    layer: 'west',
    tier: 'major',
    color: 0xc0d0d8,
    stars: [[22.14, -46.96, 1.4], [22.71, -46.88, 1.2], [23.17, -45.25, 1.15]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '孔雀',
    layer: 'west',
    tier: 'major',
    color: 0xc8c8d0,
    stars: [[20.43, -56.74, 1.35], [18.29, -61.49, 1.2], [18.79, -63.11, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '凤凰',
    layer: 'west',
    tier: 'major',
    color: 0xd0c0b0,
    stars: [[0.44, -42.31, 1.35], [1.1, -46.72, 1.2], [23.95, -45.75, 1.15]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '剑鱼',
    layer: 'west',
    tier: 'major',
    color: 0xb0d0e0,
    stars: [[5.56, -69.87, 1.2], [4.57, -55.07, 1.15], [5.9, -63.87, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '豺狼',
    layer: 'west',
    tier: 'major',
    color: 0xc8b8a8,
    stars: [[15.36, -40.39, 1.3], [14.69, -47.39, 1.2], [15.58, -41.17, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '巨蛇',
    layer: 'west',
    tier: 'major',
    color: 0xc0c0b0,
    stars: [[15.74, 6.43, 1.3], [15.85, 15.66, 1.2], [18.35, -2.9, 1.25], [18.94, 4.2, 1.15]],
    lines: [[1, 0], [0, 2], [2, 3]],
    labelAt: 0
  },
  {
    name: '盾牌',
    layer: 'west',
    tier: 'major',
    color: 0xc8c0a8,
    stars: [[18.59, -8.24, 1.2], [18.78, -4.75, 1.1], [18.83, -9.77, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '狐狸',
    layer: 'west',
    tier: 'major',
    color: 0xd0c8b8,
    stars: [[19.48, 24.66, 1.2], [19.27, 24.84, 1.1], [20.37, 22.96, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '唧筒',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c0,
    stars: [[10.37, -31.07, 1.1], [10.95, -37.14, 1.05], [9.49, -35.95, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '天燕',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c8,
    stars: [[14.8, -79.04, 1.1], [16.34, -78.7, 1.05], [14.97, -75.16, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '天坛',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0b8c0,
    stars: [[17.53, -49.88, 1.15], [16.98, -55.99, 1.05], [17.69, -45.97, 1.05]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '雕具',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[4.68, -41.86, 1.05], [4.4, -37.14, 1], [5.08, -35.49, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '鹿豹',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb8c0c8,
    stars: [[4.95, 66.34, 1.15], [5.05, 60.44, 1.05], [7.5, 76.96, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '蝘蜓',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c0,
    stars: [[8.31, -76.92, 1.05], [10.76, -80.55, 1], [7.69, -79.31, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '圆规',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0b8c0,
    stars: [[15.29, -59.32, 1.1], [15.07, -63.43, 1], [14.71, -57.93, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '南冕',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb8c0b8,
    stars: [[19.16, -37.9, 1.1], [18.98, -37.06, 1], [19.06, -40.5, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '巨爵',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0b8b8,
    stars: [[11.32, -17.68, 1.15], [11.19, -14.78, 1.05], [11.4, -22.5, 1.05]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '小马',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xc0c0c8,
    stars: [[21.26, 5.25, 1.1], [21.1, 5.14, 1], [21.38, 6.81, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '天炉',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[3.2, -28.99, 1.1], [2.8, -32.41, 1], [3.74, -37.14, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '时钟',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[2.98, -50.18, 1.05], [4.14, -64.07, 1], [2.62, -40.3, 1]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '水蛇',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c0,
    stars: [[0.43, -77.15, 1.1], [1.98, -61.57, 1.05], [3.79, -74.24, 1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '印第安',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0b0b8,
    stars: [[20.63, -47.29, 1.1], [21.97, -54.99, 1], [20.73, -58.45, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '蝎虎',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb8c0c8,
    stars: [[22.52, 50.28, 1.1], [22.27, 37.75, 1.05], [22.71, 44.33, 1]],
    lines: [[1, 2], [2, 0]],
    labelAt: 0
  },
  {
    name: '小狮',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xc0c0b8,
    stars: [[10.12, 35.97, 1.15], [10.53, 36.71, 1.05], [9.7, 23.77, 1.05]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '天猫',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb8c0c0,
    stars: [[9.35, 34.39, 1.1], [6.95, 58.42, 1.05], [8.14, 43.19, 1]],
    lines: [[0, 2], [2, 1]],
    labelAt: 0
  },
  {
    name: '山案',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[6.68, -70.93, 1.05], [5.04, -71.31, 1], [4.63, -74.93, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '显微镜',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[20.83, -33.78, 1.05], [21.39, -40.81, 1], [21.02, -32.17, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '苍蝇',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c0,
    stars: [[12.62, -69.14, 1.1], [12.77, -68.11, 1], [12.3, -65.74, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '矩尺',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[16.33, -50.16, 1.05], [16.28, -57.47, 1], [15.92, -44.8, 1]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '南极',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa0b0c0,
    stars: [[21.86, -82.23, 1.1], [14.75, -83.67, 1], [0.16, -85.26, 1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '绘架',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[5.79, -51.07, 1.05], [6.8, -61.49, 1], [4.85, -53.23, 1]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '罗盘',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c0,
    stars: [[8.73, -33.2, 1.1], [8.65, -35.31, 1], [9.15, -28.85, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '网罟',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[4.24, -62.47, 1.05], [3.74, -64.81, 1], [4.14, -67.23, 1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '玉夫',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[1, -29.36, 1.05], [0.58, -33, 1], [1.45, -25.29, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '六分仪',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0b8b8,
    stars: [[10.13, -0.37, 1.05], [10, -8.24, 1], [9.87, 4.86, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '望远镜',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b0b8,
    stars: [[18.45, -45.97, 1.05], [18.98, -42.49, 1], [19.28, -51.33, 1]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '南三角',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0c0c8,
    stars: [[16.81, -69.03, 1.2], [15.92, -63.43, 1.1], [15.31, -68.68, 1.1]],
    lines: [[0, 1], [1, 2], [2, 0]],
    labelAt: 0
  },
  {
    name: '杜鹃',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xb0b8c0,
    stars: [[22.31, -60.26, 1.15], [0.53, -64.53, 1.05], [23.79, -65.24, 1.05]],
    lines: [[0, 2], [2, 1]],
    labelAt: 0
  },
  {
    name: '飞鱼',
    layer: 'west',
    tier: 'minor',
    label: false,
    color: 0xa8b8c8,
    stars: [[8.04, -72.61, 1.1], [7.61, -72.6, 1], [8.66, -66.85, 1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '北斗',
    layer: 'east',
    tier: 'core',
    color: 0xf0e8d4,
    stars: [[11.06, 61.75, 1.55], [11.03, 56.38, 1.4], [11.9, 53.69, 1.3], [12.26, 57.03, 1.2], [12.9, 55.96, 1.45], [13.4, 54.92, 1.4], [13.79, 49.31, 1.35]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    labelAt: 3
  },
  {
    name: '紫微垣',
    layer: 'east',
    tier: 'core',
    color: 0xf2e6c8,
    stars: [[2.53, 89.26, 1.5], [17.53, 86.59, 1.15], [14.85, 74.16, 1.1], [11.06, 61.75, 1.2], [15.35, 71.83, 1.15]],
    lines: [[0, 1], [1, 2], [2, 4], [4, 3]],
    labelAt: 0
  },
  {
    name: '太微垣',
    layer: 'east',
    tier: 'core',
    color: 0xe8d8b0,
    stars: [[11.82, 14.57, 1.4], [11.24, 15.43, 1.25], [10.28, 19.84, 1.2], [11.9, 3.4, 1.15], [12.93, 3.4, 1.15]],
    lines: [[2, 1], [1, 0], [0, 3], [3, 4]],
    labelAt: 0
  },
  {
    name: '天市垣',
    layer: 'east',
    tier: 'core',
    color: 0xd8c8a8,
    stars: [[17.24, 14.39, 1.35], [16.48, 21.49, 1.25], [17.58, 12.56, 1.2], [18.36, 9.03, 1.15], [15.74, 6.43, 1.2]],
    lines: [[1, 0], [0, 2], [2, 3], [0, 4]],
    labelAt: 0
  },
  {
    name: '角宿',
    layer: 'east',
    tier: 'core',
    color: 0xc8e0b8,
    stars: [[13.42, -11.16, 1.6], [13.04, 10.96, 1.2], [14.21, -8.66, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '亢宿',
    layer: 'east',
    tier: 'core',
    color: 0xc0d8b0,
    stars: [[14.21, -10.27, 1.35], [13.58, -0.6, 1.15], [14.7, -5.66, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '氐宿',
    layer: 'east',
    tier: 'core',
    color: 0xd0c8b0,
    stars: [[14.85, -16.04, 1.4], [15.28, -9.38, 1.3], [15.59, -14.79, 1.15]],
    lines: [[0, 1], [0, 2]],
    labelAt: 0
  },
  {
    name: '房宿',
    layer: 'east',
    tier: 'core',
    color: 0xe0b898,
    stars: [[15.98, -26.11, 1.35], [16, -22.62, 1.2], [16.34, -28.22, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '心宿',
    layer: 'east',
    tier: 'core',
    color: 0xf0a888,
    stars: [[16.49, -26.43, 1.65], [16.35, -25.59, 1.15], [16.6, -28.22, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '尾宿',
    layer: 'east',
    tier: 'core',
    color: 0xe09880,
    stars: [[16.86, -34.29, 1.3], [17.2, -43, 1.25], [17.62, -37.3, 1.2], [17.79, -40.13, 1.15]],
    lines: [[0, 1], [1, 2], [2, 3]],
    labelAt: 0
  },
  {
    name: '箕宿',
    layer: 'east',
    tier: 'core',
    color: 0xd4b898,
    stars: [[18.1, -30.42, 1.3], [18.35, -29.83, 1.25], [18.4, -34.38, 1.2]],
    lines: [[0, 1], [1, 2], [2, 0]],
    labelAt: 0
  },
  {
    name: '斗宿',
    layer: 'east',
    tier: 'core',
    color: 0xb8c8d8,
    stars: [[18.76, -26.3, 1.35], [18.35, -29.83, 1.2], [19.06, -27.67, 1.2], [19.16, -21.06, 1.25], [18.1, -30.42, 1.15]],
    lines: [[4, 1], [1, 0], [0, 2], [0, 3]],
    labelAt: 0
  },
  {
    name: '牛宿',
    layer: 'east',
    tier: 'core',
    color: 0xc8c0b0,
    stars: [[20.35, -14.78, 1.35], [20.31, -12.51, 1.2], [21.08, -17.23, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '女宿',
    layer: 'east',
    tier: 'core',
    color: 0xc0d0d8,
    stars: [[20.79, -9.5, 1.3], [21.13, -11.16, 1.15], [20.62, -5.09, 1.1]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '虚宿',
    layer: 'east',
    tier: 'core',
    color: 0xb8d0e0,
    stars: [[21.53, -5.57, 1.4], [21.63, 9.88, 1.2], [22.1, -0.32, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '危宿',
    layer: 'east',
    tier: 'core',
    color: 0xb0c8dc,
    stars: [[22.1, -0.32, 1.4], [22.72, 30.22, 1.2], [23.08, 15.21, 1.15]],
    lines: [[0, 2], [2, 1]],
    labelAt: 0
  },
  {
    name: '室宿',
    layer: 'east',
    tier: 'core',
    color: 0xc8d0e0,
    stars: [[23.08, 15.21, 1.4], [0.14, 15.18, 1.3], [22.83, 24.6, 1.15]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '壁宿',
    layer: 'east',
    tier: 'core',
    color: 0xc0d0e8,
    stars: [[0.14, 15.18, 1.35], [0.22, 29.05, 1.25], [23.08, 15.21, 1.15]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '奎宿',
    layer: 'east',
    tier: 'core',
    color: 0xd0c8b8,
    stars: [[1.68, 20.81, 1.35], [0.66, 29.05, 1.25], [1.43, 27.26, 1.15], [2.12, 24.58, 1.1]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]],
    labelAt: 0
  },
  {
    name: '娄宿',
    layer: 'east',
    tier: 'core',
    color: 0xe0c8b0,
    stars: [[1.91, 20.81, 1.35], [2.12, 23.46, 1.3], [1.91, 19.29, 1.15]],
    lines: [[2, 0], [0, 1]],
    labelAt: 0
  },
  {
    name: '胃宿',
    layer: 'east',
    tier: 'core',
    color: 0xd8c0a8,
    stars: [[3, 27.74, 1.25], [2.83, 27.26, 1.2], [3.45, 29, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '昴宿',
    layer: 'east',
    tier: 'core',
    color: 0xe8d8c0,
    stars: [[3.79, 24.14, 1.4], [3.75, 24.05, 1.15], [3.82, 24.37, 1.1], [3.74, 23.95, 1.05]],
    lines: [[1, 0], [0, 2], [0, 3]],
    labelAt: 0
  },
  {
    name: '毕宿',
    layer: 'east',
    tier: 'core',
    color: 0xe8c4a0,
    stars: [[4.6, 16.51, 1.65], [4.48, 19.18, 1.2], [4.28, 15.63, 1.15], [4.36, 17.54, 1.1]],
    lines: [[2, 0], [0, 1], [0, 3]],
    labelAt: 0
  },
  {
    name: '觜宿',
    layer: 'east',
    tier: 'core',
    color: 0xb8c8d8,
    stars: [[5.59, 9.93, 1.3], [5.54, 9.29, 1.15], [5.68, 9.65, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '参宿',
    layer: 'east',
    tier: 'core',
    color: 0xa8c0d8,
    stars: [[5.92, 7.41, 1.5], [5.68, -1.94, 1.25], [5.6, -1.2, 1.35], [5.53, -0.3, 1.25], [5.24, -8.2, 1.45]],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4]],
    labelAt: 2
  },
  {
    name: '井宿',
    layer: 'east',
    tier: 'core',
    color: 0xb0d0e0,
    stars: [[6.63, 16.4, 1.3], [6.38, 22.51, 1.25], [7.07, 20.57, 1.15], [7.58, 31.89, 1.2]],
    lines: [[0, 1], [1, 2], [2, 0], [1, 3]],
    labelAt: 0
  },
  {
    name: '鬼宿',
    layer: 'east',
    tier: 'core',
    color: 0xc8d0d0,
    stars: [[8.74, 18.15, 1.3], [8.72, 21.47, 1.2], [8.97, 11.86, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '柳宿',
    layer: 'east',
    tier: 'core',
    color: 0xb8d0b8,
    stars: [[8.55, 5.7, 1.3], [8.93, 5.95, 1.15], [9.14, 2.32, 1.1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '星宿',
    layer: 'east',
    tier: 'core',
    color: 0xc8d8b8,
    stars: [[9.46, -8.66, 1.45], [9.14, 2.32, 1.15], [10.14, -12.21, 1.1]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
  {
    name: '张宿',
    layer: 'east',
    tier: 'core',
    color: 0xd0d0b0,
    stars: [[9.68, -14.85, 1.3], [10.14, -12.21, 1.2], [10.55, -16.52, 1.1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '翼宿',
    layer: 'east',
    tier: 'core',
    color: 0xc8c8b8,
    stars: [[10.99, -18.3, 1.3], [11.32, -17.68, 1.15], [11.53, -14.78, 1.1]],
    lines: [[0, 1], [1, 2]],
    labelAt: 0
  },
  {
    name: '轸宿',
    layer: 'east',
    tier: 'core',
    color: 0xb8c8c0,
    stars: [[12.26, -17.54, 1.35], [12.15, -22.62, 1.2], [12.57, -16.52, 1.15]],
    lines: [[1, 0], [0, 2]],
    labelAt: 0
  },
]

/** 为星官/星座挂上教学向说明（西象 tips · 古象 culture · 步天歌附注） */
function attachCulture(c) {
  if (c.culture) return
  const rich = CONSTELLATION_CULTURE[c.name]
  if (rich) {
    c.culture = rich
    return
  }
  if (c.layer === 'west') {
    const tip = WEST_CONSTELLATION_TIPS[c.name]
    if (tip) c.culture = tip
    return
  }
  const note = getBuTianGeNoteForAsterism(c.name)
  if (note) {
    c.culture = {
      origin: note,
      modernRef: '据《步天歌》歌诀附注整理，教学认星用，非占卜。'
    }
  }
}

/** 合并星官文化文案 */
CONSTELLATIONS.forEach(attachCulture)

let _extraLoaded = false

/**
 * 动态加载古象繁（eastAsterisms.js，约 289 官），避免首次加载即解析大段纯数据。
 * 只在切换到「古象」或「全部」模式时才会被调用；加载后写入 CONSTELLATIONS（幂等）。
 */
export async function ensureExtraAsterisms() {
  if (_extraLoaded) return
  const { EAST_EXTRA_ASTERISMS } = await import('./eastAsterisms.js')
  for (const a of EAST_EXTRA_ASTERISMS) {
    attachCulture(a)
    CONSTELLATIONS.push(a)
  }
  _extraLoaded = true
}

/** 按名称取星官条目（含 culture） */
export function getConstellationByName(name) {
  return CONSTELLATIONS.find((c) => c.name === name) || null
}

/**
 * 行星示意轨道（相对日距已压缩，便于同屏观看）。
 * 方位角 = 日心黄经近似（J2000 平黄经 L0、近日点黄经 ϖ、偏心率 e，按 JD 推进）；
 * 尺度压缩，相对顺序 水→金→地→火→小行星带→木→土→天王→海王→冥王(矮) 正确。
 */
export const PLANETS = [
  {
    id: 'mercury',
    name: '水星',
    wuxing: '水',
    orbit: 6.4,
    size: 0.32,
    color: 0xb0b4ba,
    L0: 252.25032364,
    n: 4.0923344368,
    e: 0.20564721,
    varpi: 77.45779628,
    tex: '/textures/mercury.jpg'
  },
  {
    id: 'venus',
    name: '金星',
    wuxing: '金',
    orbit: 11.6,
    size: 0.48,
    color: 0xe8d5a0,
    L0: 181.9790995,
    n: 1.602130474,
    e: 0.00677323,
    varpi: 131.60246718,
    retrogradeSpin: true,
    tex: '/textures/venus.jpg'
  },
  {
    id: 'mars',
    name: '火星',
    wuxing: '火',
    orbit: 24.4,
    size: 0.4,
    color: 0xc45c3e,
    L0: 355.4332748,
    n: 0.524032748,
    e: 0.09340062,
    varpi: 336.06023395,
    tex: '/textures/mars.jpg'
  },
  {
    id: 'jupiter',
    name: '木星',
    wuxing: '木',
    orbit: 32.5,
    size: 1.05,
    color: 0xd4b896,
    L0: 34.3514838,
    n: 0.083085314,
    e: 0.04849485,
    varpi: 14.33130973,
    tex: '/textures/jupiter.jpg'
  },
  {
    id: 'saturn',
    name: '土星',
    wuxing: '土',
    orbit: 40.5,
    size: 0.9,
    color: 0xe0d0a8,
    L0: 50.0774714,
    n: 0.033444228,
    e: 0.05550862,
    varpi: 93.05723748,
    rings: true,
    tex: '/textures/saturn.jpg',
    ringTex: '/textures/saturn_ring.png'
  },
  {
    id: 'uranus',
    name: '天王星',
    orbit: 49.5,
    size: 0.62,
    color: 0x9ec8d4,
    L0: 313.23218,
    n: 0.01173662,
    e: 0.04725744,
    varpi: 170.96424,
    retrogradeSpin: true
  },
  {
    id: 'neptune',
    name: '海王星',
    orbit: 58,
    size: 0.58,
    color: 0x4a6fd4,
    L0: 304.88003,
    n: 0.00598103,
    e: 0.00859048,
    varpi: 44.97135
  },
  {
    id: 'pluto',
    name: '冥王星',
    orbit: 66.5,
    size: 0.24,
    color: 0xc4a882,
    L0: 238.92881,
    n: 0.00397965,
    e: 0.2488273,
    varpi: 224.06676,
    dwarf: true
  }
]

function norm360(x) {
  x %= 360
  return x < 0 ? x + 360 : x
}

/**
 * 日心黄经近似（度）：平黄经 + 中心差。
 * 场景只用角度；轨道半径为压缩示意尺度。
 */
export function planetHeliocentricLon(jd, p) {
  const d = jd - 2451545.0
  const L = norm360(p.L0 + p.n * d)
  const Mdeg = norm360(L - p.varpi)
  const M = (Mdeg * Math.PI) / 180
  const e = p.e
  const C =
    (2 * e - (e * e * e) / 4) * Math.sin(M) +
    1.25 * e * e * Math.sin(2 * M) +
    (13 / 12) * e * e * e * Math.sin(3 * M)
  return norm360(L + (C * 180) / Math.PI)
}

/** 日心黄经 → 场景方位角（弧度），与地球 (sunLon+180) 同一坐标系 */
export function planetAngle(jd, p) {
  return (planetHeliocentricLon(jd, p) * Math.PI) / 180
}

/** 木星半长轴（AU）；地心黄经用真实尺度，不用场景压缩半径 */
const JUPITER_A_AU = 5.202603

/**
 * 十二次：黄道十二等分（春分点起算，每 30°）。
 * 与年支「太岁」不是同一套；岁星所在次须按木星黄经取，勿用干支年支硬套。
 */
export const SHI_ER_CI = [
  '降娄',
  '大梁',
  '实沈',
  '鹑首',
  '鹑火',
  '鹑尾',
  '寿星',
  '大火',
  '析木',
  '星纪',
  '玄枵',
  '娵訾'
]

/** 黄经（度）→ 十二次名 */
export function shiErCiFromEclipticLon(lonDeg) {
  const lon = norm360(lonDeg)
  return SHI_ER_CI[Math.floor(lon / 30) % 12]
}

/**
 * 木星地心黄经近似（度）。
 * earthHelioLonDeg：地球日心黄经（≈ 太阳地心视黄经 + 180°）。
 */
export function jupiterGeocentricLon(jd, earthHelioLonDeg) {
  const j = PLANETS.find((p) => p.id === 'jupiter')
  if (!j) return null
  const trueLon = planetHeliocentricLon(jd, j)
  const d = jd - 2451545.0
  const L = norm360(j.L0 + j.n * d)
  const Mdeg = norm360(L - j.varpi)
  const M = (Mdeg * Math.PI) / 180
  const e = j.e
  const C =
    (2 * e - (e * e * e) / 4) * Math.sin(M) +
    1.25 * e * e * Math.sin(2 * M) +
    (13 / 12) * e * e * e * Math.sin(3 * M)
  const nu = M + C
  const rJ = (JUPITER_A_AU * (1 - e * e)) / (1 + e * Math.cos(nu))
  const rE = 1.000001
  const Lj = (trueLon * Math.PI) / 180
  const Le = (norm360(earthHelioLonDeg) * Math.PI) / 180
  const x = rJ * Math.cos(Lj) - rE * Math.cos(Le)
  const y = rJ * Math.sin(Lj) - rE * Math.sin(Le)
  return norm360((Math.atan2(y, x) * 180) / Math.PI)
}

/**
 * 岁星文案：按木星地心黄经取十二次（与年干支「太岁」无关，勿拼「岁在××」）。
 * 仅岁星一条；七政可另扩，UI 不必一次全列。
 */
export function formatSuiXing(jd, sunGeocentricLon) {
  const earthHelio = norm360(sunGeocentricLon + 180)
  const lon = jupiterGeocentricLon(jd, earthHelio)
  if (lon == null || Number.isNaN(lon)) return { text: '', ci: '', lon: null }
  const ci = shiErCiFromEclipticLon(lon)
  return { text: `星次${ci}`, ci, lon }
}

export function makeStarDiscTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.2)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/** 十字闪光星贴图（商业星空插画常见的四点星芒） */
export function makeStarCrossTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const cx = 64
  const cy = 64
  ctx.clearRect(0, 0, 128, 128)
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18)
  core.addColorStop(0, 'rgba(255,255,255,1)')
  core.addColorStop(0.4, 'rgba(230,245,255,0.9)')
  core.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = core
  ctx.fillRect(0, 0, 128, 128)
  const beam = (angle, len, w) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    const g = ctx.createLinearGradient(0, -len, 0, len)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.45, 'rgba(220,240,255,0.55)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.55, 'rgba(220,240,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(-w, -len, w * 2, len * 2)
    ctx.restore()
  }
  beam(0, 58, 1.8)
  beam(Math.PI / 2, 58, 1.8)
  beam(Math.PI / 4, 36, 1.1)
  beam(-Math.PI / 4, 36, 1.1)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

let _starDisc = null
let _starCross = null
function starDisc() {
  if (!_starDisc) _starDisc = makeStarDiscTexture()
  return _starDisc
}
function starCross() {
  if (!_starCross) _starCross = makeStarCrossTexture()
  return _starCross
}

/**
 * 闪烁星空：独立相位 + 可选十字星芒（插画感闪光）
 */
export function makeStarField(count, rMin, rMax, color, size, opacity, opts = {}) {
  const { crossed = false } = opts
  const pos = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const speed = new Float32Array(count)
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin)
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
    pos[i * 3 + 1] = r * Math.cos(ph)
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    phase[i] = Math.random() * Math.PI * 2
    speed[i] = 0.28 + Math.random() * 2.6
    sizes[i] = size * (0.5 + Math.random() * (crossed ? 1.4 : 1.15))
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMap: { value: crossed ? starCross() : starDisc() },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uPixelRatio: {
        value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1
      },
      uCrossed: { value: crossed ? 1 : 0 }
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aSpeed;
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vTwinkle;
      void main() {
        float tw = 0.58 + 0.42 * sin(uTime * aSpeed + aPhase);
        tw *= 0.86 + 0.14 * sin(uTime * aSpeed * 3.3 + aPhase * 1.9);
        float spike = step(0.86, fract(sin(aPhase * 12.9898) * 43758.5453));
        tw += spike * 0.28 * max(0.0, sin(uTime * (aSpeed * 6.2) + aPhase));
        vTwinkle = clamp(tw, 0.22, 1.45);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = max(1.0, -mvPosition.z);
        // 远距衰减设下限，避免环视远角星点缩成亚像素
        float atten = 320.0 / dist;
        gl_PointSize = max(1.85, aSize * uPixelRatio * atten * (0.75 + 0.55 * vTwinkle));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uCrossed;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float a = tex.a * uOpacity * clamp(vTwinkle, 0.0, 1.25);
        if (a < 0.012) discard;
        vec3 col = uColor * (0.62 + 0.72 * vTwinkle);
        if (uCrossed > 0.5) {
          col = mix(col, vec3(1.0, 0.97, 0.92), 0.35 * vTwinkle);
        }
        gl_FragColor = vec4(col, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    fog: false
  })
  const points = new THREE.Points(geo, mat)
  points.userData.twinkle = true
  points.renderOrder = -4
  points.frustumCulled = false
  return points
}

/**
 * 银河感稀疏星尘：沿弱倾斜大圆略微聚集，绝不连成糊痕光带
 */
export function makeGalaxyBand(count = 900, radius = 155) {
  const pos = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const speed = new Float32Array(count)
  const sizes = new Float32Array(count)
  const tilt = 0.55
  const yaw = 0.85
  for (let i = 0; i < count; i++) {
    const t = Math.random()
    // 宽散点，不做「中心极密」；纬度跨度大，避免细条横切
    const along = (Math.random() * 2 - 1) * Math.PI
    const lat = (Math.random() - 0.5) * (0.55 + Math.random() * 0.45)
    const rr = radius * (0.88 + Math.random() * 0.24)
    let x = Math.cos(along) * Math.cos(lat) * rr
    let y = Math.sin(lat) * rr
    let z = Math.sin(along) * Math.cos(lat) * rr
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt)
    const z2 = y * Math.sin(tilt) + z * Math.cos(tilt)
    y = y2
    z = z2
    const x3 = x * Math.cos(yaw) - z * Math.sin(yaw)
    const z3 = x * Math.sin(yaw) + z * Math.cos(yaw)
    x = x3
    z = z3
    x += (Math.random() - 0.5) * 14
    y += (Math.random() - 0.5) * 12
    z += (Math.random() - 0.5) * 14
    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
    phase[i] = Math.random() * Math.PI * 2
    speed[i] = 0.35 + Math.random() * 1.4
    sizes[i] = (0.35 + t * 0.75) * (0.7 + Math.random() * 0.5)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMap: { value: starDisc() },
      uColor: { value: new THREE.Color(0xc8d8e4) },
      uOpacity: { value: 0.28 },
      uPixelRatio: {
        value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1
      },
      uCrossed: { value: 0 }
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aSpeed;
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vTwinkle;
      void main() {
        vTwinkle = 0.78 + 0.22 * sin(uTime * aSpeed + aPhase);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = max(1.0, -mvPosition.z);
        float atten = 220.0 / dist;
        gl_PointSize = max(0.9, aSize * uPixelRatio * atten * (0.9 + 0.2 * vTwinkle));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float a = tex.a * uOpacity * vTwinkle;
        if (a < 0.02) discard;
        gl_FragColor = vec4(uColor * (0.75 + 0.3 * vTwinkle), a);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    fog: false
  })
  const points = new THREE.Points(geo, mat)
  points.userData.twinkle = true
  points.renderOrder = -4
  points.frustumCulled = false
  return points
}

/** 小行星尘粒贴图：硬边碎石点，中心实、边缘陡降到 0，无高斯柔光晕 */
let _asteroidDust = null
function asteroidDust() {
  if (_asteroidDust) return _asteroidDust
  const s = 32
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(s, s)
  const cx = (s - 1) * 0.5
  const cy = (s - 1) * 0.5
  const rMax = s * 0.34
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const r = Math.hypot(x - cx, y - cy) / rMax
      // 核满不透明；仅最外 ~25% 做极窄抗锯齿，避免 Additive/软盘糊雾
      let a = 0
      if (r <= 0.72) a = 1
      else if (r < 1) a = Math.pow(1 - (r - 0.72) / 0.28, 4)
      if (a < 0.06) a = 0
      const i = (y * s + x) * 4
      img.data[i] = 255
      img.data[i + 1] = 255
      img.data[i + 2] = 255
      img.data[i + 3] = Math.round(a * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  tex.needsUpdate = true
  _asteroidDust = tex
  return tex
}

/**
 * 主带径向权重（f∈[0,1] 映射压缩后的火星–木星夹层）。
 * 环向应大致均匀；径向非平坦：中部略密 + 浅 Kirkwood 缺口（教学可见、不过度挖空）。
 * 真实 Kirkwood 主要体现在半长轴直方图；瞬时空间快照因偏心率会弱一些，故缝做浅。
 */
function asteroidBeltRadialWeight(f) {
  const edge =
    Math.min(1, Math.max(0, f / 0.05)) * Math.min(1, Math.max(0, (1 - f) / 0.07))
  // 内/中带略密于外缘（对照 ~2.1–3.3 AU 的常见剖面感）
  const envelope = Math.exp(-(((f - 0.4) / 0.42) ** 2))
  let w = (0.22 + 0.78 * envelope) * edge
  // 浅缝：约对应 3:1 / 5:2 / 7:3 / 2:1（映射到本可视化径向）
  const gaps = [
    [0.333, 0.026, 0.5],
    [0.5, 0.02, 0.4],
    [0.575, 0.016, 0.3],
    [0.9, 0.03, 0.45]
  ]
  for (let g = 0; g < gaps.length; g++) {
    const [c, s, depth] = gaps[g]
    const t = (f - c) / s
    w *= 1 - depth * Math.exp(-t * t)
  }
  return Math.max(w, 0.012)
}

function asteroidBeltSampleRadiusFrac(cdf) {
  const x = Math.random()
  let lo = 0
  let hi = cdf.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cdf[mid] < x) lo = mid + 1
    else hi = mid
  }
  const prev = lo > 0 ? cdf[lo - 1] : 0
  const span = cdf[lo] - prev
  const t = span > 1e-12 ? (x - prev) / span : 0
  return (lo + t) / cdf.length
}

function asteroidBeltGauss() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v)
}

/** 火星–木星之间小行星带（压缩尺度下夹在火星与木星轨道之间） */
export function makeAsteroidBelt(count = 7200, rInner = 26.2, rOuter = 30.8) {
  const pos = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  const speed = new Float32Array(count)
  const radius = new Float32Array(count)
  const yOff = new Float32Array(count)
  const span = rOuter - rInner

  // 径向 CDF：有结构，但避免「纯随机 + 错误集中」造成的噪点斑块
  const bins = 256
  const weights = new Float32Array(bins)
  for (let b = 0; b < bins; b++) weights[b] = asteroidBeltRadialWeight((b + 0.5) / bins)
  const cdf = new Float32Array(bins)
  let sum = 0
  for (let b = 0; b < bins; b++) {
    sum += weights[b]
    cdf[b] = sum
  }
  for (let b = 0; b < bins; b++) cdf[b] /= sum

  for (let i = 0; i < count; i++) {
    // 环向分层 + 亚格点抖动：消除泊松扎堆，又不呈完美晶格
    const ang = ((i + 0.5 + (Math.random() - 0.5) * 0.9) / count) * Math.PI * 2
    const f = asteroidBeltSampleRadiusFrac(cdf)
    const rr = rInner + span * f
    // 薄环面高斯厚度（真实带很厚且极稀疏；教学上仍压成可读环带）
    const yy = Math.max(-1.05, Math.min(1.05, asteroidBeltGauss() * 0.4))
    radius[i] = rr
    phase[i] = ang
    // 内侧略快；速度抖动压小，避免差分运动很快重新搅出团块感
    speed[i] = 0.012 + (rOuter - rr) * 0.0018 + Math.random() * 0.0016
    yOff[i] = yy
    pos[i * 3] = Math.cos(ang) * rr
    pos[i * 3 + 1] = yy
    pos[i * 3 + 2] = -Math.sin(ang) * rr
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  // 小硬点：size 压低避免 sizeAttenuation 拉成大晕；NormalBlending + alphaTest 保利落边缘
  const mat = new THREE.PointsMaterial({
    color: 0xcbb89a,
    size: 0.2,
    map: asteroidDust(),
    transparent: true,
    opacity: 0.94,
    sizeAttenuation: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    alphaTest: 0.4,
    toneMapped: false
  })
  const points = new THREE.Points(geo, mat)
  points.renderOrder = -5
  points.frustumCulled = false
  points.userData.asteroidBelt = { radius, phase, speed, yOff, count }
  return points
}

export function updateAsteroidBelt(points, dt) {
  const data = points?.userData?.asteroidBelt
  if (!data) return
  const pos = points.geometry.attributes.position.array
  for (let i = 0; i < data.count; i++) {
    data.phase[i] += data.speed[i] * dt
    const a = data.phase[i]
    const r = data.radius[i]
    pos[i * 3] = Math.cos(a) * r
    pos[i * 3 + 1] = data.yOff[i] + Math.sin(a * 2.3 + i) * 0.04
    pos[i * 3 + 2] = -Math.sin(a) * r
  }
  points.geometry.attributes.position.needsUpdate = true
}

/** 细长淡青白彗尾：核端略亮、远端渐隐，无硬边大锥 */
function makeCometTailTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 32
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, 256, 32)
  const g = ctx.createLinearGradient(0, 0, 256, 0)
  g.addColorStop(0, 'rgba(235,248,252,0.5)')
  g.addColorStop(0.18, 'rgba(200,230,240,0.28)')
  g.addColorStop(0.55, 'rgba(170,210,225,0.12)')
  g.addColorStop(1, 'rgba(150,190,210,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, 11)
  ctx.lineTo(0, 21)
  ctx.quadraticCurveTo(70, 20, 256, 16)
  ctx.quadraticCurveTo(70, 12, 0, 11)
  ctx.closePath()
  ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * 彗星：小核 + 半透明细长尘尾平面（无粗锥/聚光灯）
 * 默认高倾角、短尾，避开黄道节气标签面
 */
export function createComet(opts = {}) {
  const {
    a = 52,
    e = 0.74,
    incl = 0.95,
    omega = 1.15,
    period = 140,
    phase = 0.85,
    color = 0xb8d8e8,
    name = '彗星'
  } = opts

  const group = new THREE.Group()
  group.userData.comet = { a, e, incl, omega, period, phase, color }
  group.renderOrder = -2

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xe8f4f8,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    })
  )
  nucleus.renderOrder = -2
  group.add(nucleus)

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: starDisc(),
      color: 0xc8e4ee,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    })
  )
  glow.scale.set(0.55, 0.55, 1)
  glow.renderOrder = -2
  group.add(glow)

  const coma = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xa8d0dc,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  coma.renderOrder = -2
  group.add(coma)

  const dustTail = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: makeCometTailTexture(),
      color: 0xc0dde8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide
    })
  )
  dustTail.renderOrder = -3
  group.add(dustTail)

  // 不再用密粒子尾（易成「大白锥+雪花点」）
  group.userData.cometVisual = { nucleus, glow, coma, dustTail }
  return group
}

/** 更新彗星位置与彗尾朝向（背离太阳） */
export function updateComet(group, tSec) {
  const c = group?.userData?.comet
  const v = group?.userData?.cometVisual
  if (!c || !v) return

  const mean = c.phase + (tSec / c.period) * Math.PI * 2
  let E = mean
  for (let k = 0; k < 5; k++) {
    E = mean + c.e * Math.sin(E)
  }
  const cosE = Math.cos(E)
  const sinE = Math.sin(E)
  const r = c.a * (1 - c.e * cosE)
  const xOrb = c.a * (cosE - c.e)
  const zOrb = c.a * Math.sqrt(1 - c.e * c.e) * sinE
  const cosO = Math.cos(c.omega)
  const sinO = Math.sin(c.omega)
  const cosI = Math.cos(c.incl)
  const sinI = Math.sin(c.incl)
  const x = xOrb * cosO - zOrb * sinO * cosI
  const y = zOrb * sinI
  const z = xOrb * sinO + zOrb * cosO * cosI
  group.position.set(x, y, z)

  // 贴近黄道铭文带时自动淡出，绝不挡节气字
  const veil = THREE.MathUtils.smoothstep(Math.abs(y), 4.2, 10)
  if (veil < 0.04) {
    group.visible = false
    return
  }
  group.visible = true

  const away = group.position.clone()
  if (away.lengthSq() < 1e-6) away.set(1, 0, 0)
  else away.normalize()
  const nearFactor = THREE.MathUtils.clamp(1.1 - r / (c.a * 1.4), 0.18, 1)
  const tailLen = 2.6 + nearFactor * 2.4
  const tailW = 0.12 + nearFactor * 0.08

  v.dustTail.scale.set(tailLen, tailW, 1)
  v.dustTail.position.copy(away).multiplyScalar(tailLen * 0.5)
  v.dustTail.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), away)
  v.dustTail.material.opacity = (0.07 + nearFactor * 0.1) * veil

  v.coma.scale.setScalar(0.45 + nearFactor * 0.28)
  v.coma.material.opacity = (0.035 + nearFactor * 0.04) * veil
  v.glow.scale.setScalar(0.28 + nearFactor * 0.16)
  v.glow.material.opacity = (0.16 + nearFactor * 0.12) * veil
  v.nucleus.material.opacity = (0.5 + nearFactor * 0.2) * veil
}

/**
 * 天球星云：玄夜蓝黑底 + 极淡墨青团雾（无横切糊痕光带）。
 * 程序生成，非外部版权图。
 */
export function makeNebulaShell(radius = 220) {
  const c = document.createElement('canvas')
  c.width = 1536
  c.height = 768
  const ctx = c.getContext('2d')
  const base = ctx.createLinearGradient(0, 0, 0, 768)
  base.addColorStop(0, '#070b12')
  base.addColorStop(0.4, '#0a121c')
  base.addColorStop(0.75, '#0c1520')
  base.addColorStop(1, '#080e16')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 1536, 768)

  // 仅保留很淡的区域团雾，不再画斜贯白带
  const blobs = [
    [320, 240, 320, 'rgba(40,80,110,0.16)'],
    [880, 200, 360, 'rgba(50,100,130,0.14)'],
    [700, 420, 380, 'rgba(60,110,140,0.12)'],
    [200, 500, 220, 'rgba(90,130,140,0.08)'],
    [1200, 460, 240, 'rgba(160,100,60,0.05)'],
    [1000, 280, 200, 'rgba(70,120,150,0.1)']
  ]
  for (const [x, y, r, col] of blobs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, col)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 40),
    new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      depthTest: true,
      fog: false
    })
  )
  // 先于星点绘制，避免半透明壳盖住星空
  mesh.renderOrder = -20
  return mesh
}

/**
 * 极淡区域雾精灵（可选氛围）；刻意低不透明度，避免像划痕/雾团糊带
 */
export function makeNebulaSprites() {
  const group = new THREE.Group()
  const specs = [
    { rgba: 'rgba(60,110,140,0.18)', size: 36, pos: [-48, 22, -62] },
    { rgba: 'rgba(70,130,155,0.16)', size: 40, pos: [55, 6, -68] },
    { rgba: 'rgba(100,150,165,0.12)', size: 28, pos: [8, 34, -78] }
  ]
  for (const s of specs) {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
    g.addColorStop(0, s.rgba)
    g.addColorStop(0.55, s.rgba.replace(/0\.\d+\)$/, '0.04)'))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    const spr = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending
      })
    )
    spr.scale.set(s.size, s.size * 0.85, 1)
    spr.position.set(...s.pos)
    spr.userData.drift = 0.06 + Math.random() * 0.08
    group.add(spr)
  }
  return group
}
