/**
 * 岁差（axial precession）教学模型
 *
 * 采用「固定黄道极点 + 赤道整体进动」的教科书近似：把整片恒星场绕 J2000
 * 北黄极轴按累计进动角 θ(year) 缓慢旋转（约 50.29″/年，2.6 万年一周）。
 * 于是北天极沿半径 ≈ 黄赤交角 23.44° 的「极路径环」在恒星背景里移动，极星
 * 历代更替；历法冬至点（黄经 270°）相对恒星标志点也随之一同漂移。
 *
 * 数值校准（示意图精度内，已由测试锁定）：
 *  - year 2000：北天极 = J2000 天极（0h, +90°）
 *  - year -2800：北天极≈右枢（天龙座 α，14.06h, +64.4°）
 *  - year  2100：北天极在勾陈一（2.53h, +89.26°）一两度内
 *
 * 坐标约定：局部天球 +Y = 北天极（J2000）、XZ = 赤道面、+X = RA 0h。
 * 纯数学模块，不依赖 three，可在 node 下单测。
 */

/** J2000 黄赤交角（度，固定近似基准） */
export const J2000_OBLIQUITY_DEG = 23.43929111

/** J2000 北黄极在天球局部坐标系的单位向量（[0, cosε, −sinε]） */
const E0 = (J2000_OBLIQUITY_DEG * Math.PI) / 180
export const PRECESSION_AXIS = [0, Math.cos(E0), -Math.sin(E0)]

/** 平均黄赤交角（度）：ε ≈ 23.43929111 − 0.0130042·T，T 为距 J2000 的儒略世纪 */
export function meanObliquityDeg(year) {
  const T = (year - 2000) / 100
  return J2000_OBLIQUITY_DEG - 0.0130042 * T
}

/**
 * 累计岁差（总进动，度）：θ ≈ 1.396971·T + 0.0003086·T²
 * T 为儒略世纪（=(year−2000)/100）。过去为负、未来为正；J2000 处为 0。
 */
export function accumulatedPrecessionDeg(year) {
  const T = (year - 2000) / 100
  return 1.396971 * T + 0.0003086 * T * T
}

/** 轴角：将向量 vec 绕 PRECESSION_AXIS 右旋 angle 弧度，返回新向量 */
export function rotateAboutPole(vec, angleRad) {
  const [ax, ay, az] = PRECESSION_AXIS
  const [x, y, z] = vec
  const c = Math.cos(angleRad)
  const s = Math.sin(angleRad)
  const dot = ax * x + ay * y + az * z
  const cx = ay * z - az * y
  const cy = az * x - ax * z
  const cz = ax * y - ay * x
  return [
    x * c + cx * s + ax * dot * (1 - c),
    y * c + cy * s + ay * dot * (1 - c),
    z * c + cz * s + az * dot * (1 - c)
  ]
}

/** 单位向量 → {ra: 赤经时, dec: 赤纬度} */
function raDecFromVec([x, y, z]) {
  const dec = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI
  let ra = (Math.atan2(z, x) * 180) / Math.PI
  if (ra < 0) ra += 360
  return { ra: ra / 15, dec }
}

/**
 * 第 year 年「北天极」落在恒星背景的坐标 {ra, dec}。
 * 即此刻距真天极最近的天区方向（= rotateAboutPole((0,1,0), θ(year))）。
 */
export function northCelestialPoleYear(year) {
  return raDecFromVec(rotateAboutPole([0, 1, 0], accumulatedPrecessionDeg(year) * (Math.PI / 180)))
}

/** J2000 冬至点天区固定方向（RA 18h, Dec −ε） */
const SOLSTICE_VEC = (() => {
  const dec = (-J2000_OBLIQUITY_DEG * Math.PI) / 180
  const ra = (18 * 15 * Math.PI) / 180
  return [Math.cos(dec) * Math.cos(ra), Math.sin(dec), Math.cos(dec) * Math.sin(ra)]
})()

/**
 * 第 year 年「历法冬至点（太阳黄经 270°）」落在恒星背景的坐标 {ra, dec}。
 * 冬至标志点相对恒星以约 50″/年「西移」，即岁差最直观的体现。
 */
export function winterSolsticePointYear(year) {
  return raDecFromVec(rotateAboutPole(SOLSTICE_VEC, accumulatedPrecessionDeg(year) * (Math.PI / 180)))
}

/** 极星候选（示意坐标）：名称 + J2000 赤经时 / 赤纬度 + 历史注 */
export const POLE_STARS = [
  { name: '勾陈一', ra: 2.529, dec: 89.264, note: '今之极星（小熊座 α）' },
  { name: '右枢', ra: 14.064, dec: 64.375, note: '前 28 世纪前后的极星（天龙座 α）' },
  { name: '织女一', ra: 18.615, dec: 38.783, note: '约公元 14 千纪最近极（天琴座 α）' }
]

/** 两 {ra,dec} 坐标点之间的球面角距离（度） */
function angularDistanceDeg(a, b) {
  const toRad = Math.PI / 180
  const raA = a.ra * 15 * toRad
  const decA = a.dec * toRad
  const raB = b.ra * 15 * toRad
  const decB = b.dec * toRad
  const d =
    Math.cos(decA) * Math.cos(decB) * Math.cos(raA - raB) + Math.sin(decA) * Math.sin(decB)
  return Math.acos(Math.max(-1, Math.min(1, d))) / toRad
}

/**
 * 第 year 年距天极最近的已知极星。阈值 6° 内返回 { name, distDeg, note }，
 * 空窗期（极星在亮星间漂移）返回 null。
 */
export function nearestPoleStar(year) {
  const pole = northCelestialPoleYear(year)
  let best = null
  for (const s of POLE_STARS) {
    const distDeg = angularDistanceDeg(pole, s)
    if (distDeg <= 6 && (!best || distDeg < best.distDeg)) best = { ...s, distDeg }
  }
  return best
}