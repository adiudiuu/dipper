<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import WebGL from 'three/examples/jsm/capabilities/WebGL.js'
import {
  DAY_MS,
  DEG,
  JIEQI,
  SYNODIC,
  beijingDayStartMs,
  beijingNoonJD,
  civilOfMs,
  localSiderealDeg
} from '../lib/calendar.js'
import {
  CONSTELLATIONS,
  PLANETS,
  createComet,
  makeAsteroidBelt,
  makeGalaxyBand,
  makeNebulaShell,
  makeNebulaSprites,
  makeStarField,
  planetAngle,
  raDecToVec,
  updateAsteroidBelt,
  updateComet
} from '../lib/sky.js'
import {
  POLE_STARS,
  PRECESSION_AXIS,
  accumulatedPrecessionDeg,
  nearestPoleStar
} from '../lib/precession.js'

import { useScrubControl } from '../composables/useScrubControl.js'

const props = defineProps({
  sunLon: { type: Number, required: true },
  moonAge: { type: Number, required: true },
  currentMs: { type: Number, required: true },
  currentTerm: { type: String, default: '' },
  /** 星象层：west 西象 | east 古象（core+extra）| all 两层同显；east-core 内部兼容 */
  constellationMode: { type: String, default: 'east' },
  /** 星象层名称显隐（西象/古象均生效） */
  eastLabels: { type: Boolean, default: true },
  /** 视角：orbit 轨透视 | ground 地面观星 */
  viewMode: { type: String, default: 'orbit' },
  /** 地面观星视角的观测者经纬度 */
  observerLat: { type: Number, default: 39.9 },
  observerLon: { type: Number, default: 116.4 },
  /** 窄屏：降标签密度、短行星名、远距/叠日隐藏 */
  compactLabels: { type: Boolean, default: false },
  /** 高亮星官/星座名（来自列宿页跳转） */
  highlightNames: { type: Array, default: () => [] },
  /** 岁差观测历元（公历年份 −2000..2100；2000 = J2000 现行） */
  epochYear: { type: Number, default: 2000 }
})

const emit = defineEmits(['scrub', 'culture-open'])

const host = ref(null)
const canvas = ref(null)

/** 可変引用容器，供 useScrubControl 在 onMounted 后获取 camera/controls 等 */
const scrubCtx = {
  camera: null,
  labelRenderer: null,
  culturePickMeshes: [],
  controls: null,
  onCulturePick: openCulture
}
const scrub = useScrubControl(host, (e) => emit('scrub', e), scrubCtx)

const EARTH_ORBIT_R = 16
const MOON_ORBIT_R = 3.4
/** 星座天球：紧贴最外行星之外，默认取景即可收入外缘 */
const SKY_R = 70
/** 星座张角相对真实赤经赤纬再收一档，常见座更容易一屏看全 */
const CONSTELLATION_SPAN = 0.82
/** 默认取景：斜俯视黄道；节气圈可读，内行星+火+木外缘入画；可再滚轮拉远看全貌 */
const CAM_MIN_DIST = 14
const CAM_MAX_DIST = 210
const CAM_INIT_RADIUS = 50
const CAM_INIT_THETA = 0.66
const CAM_INIT_PHI = 0.96
const CAM_INIT_FOV = 46
/** 历象占右，取景中心略偏，使太阳/黄道在画面中部偏左 */
const FRAME_TARGET = { x: 6, y: 0, z: 2 }

/** 屏幕方位罗盘：16 方位名（自北顺时针） */
const AZ_NAMES = [
  '北', '北东北', '东北', '东东北', '东', '东东南', '东南', '南东南',
  '南', '南西南', '西南', '西西南', '西', '西西北', '西北', '北西北'
]
/** 罗盘刻度（每 15° 一格，45° 倍数为主刻度）与 8 主方位字，viewBox 120×120 */
const HUD_TICKS = Array.from({ length: 24 }, (_, i) => {
  const az = i * 15
  const major = az % 45 === 0
  const r1 = major ? 45 : 49.5
  return {
    az,
    major,
    x1: 60 + r1 * Math.sin(az * DEG),
    y1: 60 - r1 * Math.cos(az * DEG),
    x2: 60 + 55 * Math.sin(az * DEG),
    y2: 60 - 55 * Math.cos(az * DEG)
  }
})
const HUD_CARDINALS = [0, 45, 90, 135, 180, 225, 270, 315].map((az) => ({
  az,
  name: AZ_NAMES[Math.round(az / 22.5) % 16],
  x: 60 + 42 * Math.sin(az * DEG),
  y: 60 - 42 * Math.cos(az * DEG) + 3.2
}))
const AX_X = new THREE.Vector3(1, 0, 0)
const AX_Y = new THREE.Vector3(0, 1, 0)

/** 岁差参考方向（天球局部系）：J2000 北天极、进动轴（北黄极）、冬至点天区方向 */
const POLE_DIR = new THREE.Vector3(0, 1, 0)
const NEP_V3 = new THREE.Vector3(...PRECESSION_AXIS)
const SOLSTICE_DIR = raDecToVec(18, -23.43929111, 1)

/** 黄经 λ（弧度）→ 黄道 XZ；Y 为北黄极，λ 增大为自西向东（俯视逆时针） */
function eclipticPos(radius, lonRad) {
  return {
    x: Math.cos(lonRad) * radius,
    z: -Math.sin(lonRad) * radius
  }
}

let renderer
let labelRenderer
let scene
let camera
let controls
let earth
let moon
let sun
let sunGlowLayers = []
let earthOrbit
/** 日照锥：指向太阳一侧（随公转更新） */
let sunMarker
let planetGroup
let asteroidBelt
let comets = []
let twinkleStars = []
let nebulaSprites = null
let simTime = 0
let termLabelObjects = []
let lastTermName = ''
let animId = 0
let lastT = 0
let ro
let skyWestGroup = null
let skyEastGroup = null
let skyEastExtraGroup = null
let skyDome = null
/** 岁差容器：整片恒星场（星点/银河带/星座/星云）绕北黄极轴进动 */
let skyRoot = null
let eastLabelObjects = []
let westLabelObjects = []
let culturePickMeshes = []
let groundHorizon = null
/** 「北天极 · 近XX」动态铭文标签 */
let poleCaptionLabel = null
let groundSceneActive = false
let mountedAlive = false
/** 古象繁层懒加载锁，避免快速切星象时重复 build */
let eastExtraLoadPromise = null
/** 地球/行星 Sprite 标签，供 compact 密度与叠日剔除 */
let bodyLabelSprites = []
const _projA = new THREE.Vector3()
const _projB = new THREE.Vector3()
let labelCullClock = 0
/** @type {Map<string, { stars: THREE.Mesh[], halos: THREE.Mesh[], lines: THREE.Line[], label: import('three/examples/jsm/renderers/CSS2DRenderer.js').CSS2DObject | null, center: THREE.Vector3, layer: string, quiet: boolean }>} */
const constellationMap = new Map()
let focusTarget = new THREE.Vector3(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
let desiredFocus = new THREE.Vector3(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)

function applyMaterialOpacity(mesh, opacity) {
  if (!mesh?.material) return
  mesh.material.opacity = opacity
  mesh.material.transparent = true
}

function setSkyLabelHighlight(label, active, dimmed) {
  if (!label?.userData?.el) return
  const el = label.userData.el
  el.classList.toggle('is-active', active)
  el.classList.toggle('is-dim', dimmed && !active)
}

function layerVisibleForHighlight(entryLayer, mode) {
  if (mode === 'all') return true
  if (mode === 'east' || mode === 'east-core') return entryLayer === 'east'
  return entryLayer === mode
}

function applyConstellationHighlight() {
  const mode = props.constellationMode || 'east'
  const names = props.highlightNames || []
  const hasFocus = names.length > 0
  const focusSet = new Set(names)

  constellationMap.forEach((entry, name) => {
    if (!layerVisibleForHighlight(entry.layer, mode)) return
    const active = focusSet.has(name)
    const dimmed = hasFocus && !active
    const quiet = entry.quiet
    const starOp = active ? 1 : dimmed ? (quiet ? 0.08 : 0.15) : quiet ? 0.72 : 0.96
    const haloOp = active ? 0.42 : dimmed ? 0.04 : quiet ? 0.12 : 0.22
    const lineOp = active ? 0.95 : dimmed ? 0.08 : quiet ? 0.42 : 0.78
    entry.stars.forEach((m) => {
      applyMaterialOpacity(m, starOp)
      m.scale.setScalar(active ? 1.35 : 1)
    })
    entry.halos.forEach((m) => applyMaterialOpacity(m, haloOp))
    entry.lines.forEach((l) => applyMaterialOpacity(l, lineOp))
    if (entry.label) {
      entry.label.visible = props.eastLabels !== false && (!quiet || active || !dimmed)
      setSkyLabelHighlight(entry.label, active, dimmed)
    }
  })

  if (hasFocus) {
    desiredFocus.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
    let count = 0
    names.forEach((n) => {
      const e = constellationMap.get(n)
      if (e && layerVisibleForHighlight(e.layer, mode)) {
        desiredFocus.add(e.center)
        count += 1
      }
    })
    if (count > 0) {
      desiredFocus.x /= count + 1
      desiredFocus.y /= count + 1
      desiredFocus.z /= count + 1
    }
  } else {
    desiredFocus.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
  }
}

function focusConstellation(name) {
  if (!name) return
  applyConstellationHighlight()
}

function isCompactLabels() {
  if (props.compactLabels) return true
  return typeof window !== 'undefined' && window.innerWidth <= 720
}

function openCulture(constellation) {
  if (!constellation?.culture) return
  emit('culture-open', {
    name: constellation.name,
    culture: constellation.culture
  })
}

async function applyConstellationMode() {
  const mode = props.constellationMode || 'east'
  const showWest = mode === 'west' || mode === 'all'
  const showEast = mode === 'east' || mode === 'east-core' || mode === 'all'
  const showExtra = mode === 'east' || mode === 'all'
  if (skyWestGroup) skyWestGroup.visible = showWest
  if (skyEastGroup) skyEastGroup.visible = showEast
  if (skyEastExtraGroup) skyEastExtraGroup.visible = showExtra
  // 首次需要显示古象繁时动态加载 2844 行 eastAsterisms.js
  if (showExtra && skyEastExtraGroup && skyEastExtraGroup.children.length === 0) {
    if (!eastExtraLoadPromise) {
      eastExtraLoadPromise = (async () => {
        const { ensureExtraAsterisms } = await import('../lib/sky.js')
        await ensureExtraAsterisms()
        if (!mountedAlive || !skyEastExtraGroup) return
        if (skyEastExtraGroup.children.length === 0) {
          buildConstellationLayer(skyEastExtraGroup, 'east', 'extra')
        }
      })().finally(() => {
        /* 加载失败时允许重试 */
        if (!skyEastExtraGroup || skyEastExtraGroup.children.length === 0) {
          eastExtraLoadPromise = null
        }
      })
    }
    await eastExtraLoadPromise
    if (!mountedAlive) return
  }
  applyEastLabels()
  applyConstellationHighlight()
}

function applyEastLabels() {
  const mode = props.constellationMode || 'east'
  // east-core：骨架贴名；其余模式跟随题名/隐名开关（西象与古象均生效）
  const show = mode === 'east-core' || props.eastLabels !== false
  const compact = isCompactLabels()
  eastLabelObjects.forEach((lab) => {
    const quiet = lab.userData?.el?.classList?.contains('is-quiet')
    lab.visible = show && !(compact && quiet)
  })
  westLabelObjects.forEach((lab) => {
    const quiet = lab.userData?.el?.classList?.contains('is-quiet')
    lab.visible = props.eastLabels !== false && !(compact && quiet)
  })
}

/** 四立：窄屏与中气同显铭文（二分二至已属中气） */
const MAJOR_JIE_NAMES = new Set(['立春', '立夏', '立秋', '立冬'])
let termRevealTimer = null
let termRevealEl = null

function clearTermReveal() {
  if (termRevealTimer != null) {
    clearTimeout(termRevealTimer)
    termRevealTimer = null
  }
  if (termRevealEl) {
    termRevealEl.classList.remove('is-revealed')
    termRevealEl = null
  }
}

function onTermLabelActivate(el) {
  if (!isCompactLabels() || !el?.classList.contains('is-mute')) return
  clearTermReveal()
  el.classList.add('is-revealed')
  termRevealEl = el
  termRevealTimer = setTimeout(() => {
    el.classList.remove('is-revealed')
    if (termRevealEl === el) termRevealEl = null
    termRevealTimer = null
  }, 2200)
}

/** 窄屏降密：节气保留中气+四立+当前铭文，其余为可点圆点；行星短名且避开太阳投影 */
function updateLabelDensity() {
  if (!camera || !host.value) return
  const compact = isCompactLabels()
  const w = host.value.clientWidth || 1
  const h = host.value.clientHeight || 1
  const sunNearPx = Math.max(56, Math.min(w, h) * 0.14)

  if (labelRenderer?.domElement) {
    labelRenderer.domElement.classList.toggle('is-compact', compact)
  }

  termLabelObjects.forEach((obj) => {
    // 窄屏仍保留节气节点（铭文或圆点），禁止整圈消失
    obj.visible = true
    const el = obj.userData.el
    if (!el) return
    const keepName =
      !compact ||
      obj.userData.zhong ||
      MAJOR_JIE_NAMES.has(obj.userData.termName) ||
      obj.userData.active
    const mute = compact && !keepName
    el.classList.toggle('is-mute', mute)
    el.classList.toggle('is-tapable', mute)
    if (!mute) el.classList.remove('is-revealed')
  })

  // 窄屏：默认取景即藏星官字；滚轮拉近（camDist 变小）后再显
  const camDist = camera.position.length()
  const skyFar = compact && camDist > 42
  const mode = props.constellationMode || 'east'
  const showEast = mode === 'east-core' || props.eastLabels !== false
  eastLabelObjects.forEach((lab) => {
    const quiet = lab.userData?.el?.classList?.contains('is-quiet')
    lab.visible = showEast && !(compact && quiet) && !skyFar
  })
  westLabelObjects.forEach((lab) => {
    const quiet = lab.userData?.el?.classList?.contains('is-quiet')
    lab.visible = props.eastLabels !== false && !(compact && quiet) && !skyFar
  })

  if (!bodyLabelSprites.length) return

  _projA.set(0, 0, 0).project(camera)
  const sunSx = (_projA.x * 0.5 + 0.5) * w
  const sunSy = (-_projA.y * 0.5 + 0.5) * h
  const sunInFront = _projA.z < 1

  bodyLabelSprites.forEach((spr) => {
    if (!spr) return
    const baseScale = spr.userData.baseScale || 1.4
    const aspect = spr.userData.aspect || 1
    const scaleMul = compact ? 0.72 : 1
    spr.scale.set(aspect * baseScale * scaleMul, baseScale * scaleMul, 1)

    if (!compact) {
      spr.visible = true
      return
    }

    // 水金内轨：窄屏默认不贴名，从根上避免贴日
    const orbit = spr.userData.planetOrbit
    if (typeof orbit === 'number' && orbit < 13) {
      spr.visible = false
      return
    }

    spr.getWorldPosition(_projB)
    if (!sunInFront) {
      spr.visible = true
      return
    }
    _projB.project(camera)
    if (_projB.z >= 1) {
      spr.visible = false
      return
    }
    const sx = (_projB.x * 0.5 + 0.5) * w
    const sy = (-_projB.y * 0.5 + 0.5) * h
    const dx = sx - sunSx
    const dy = sy - sunSy
    // 投影贴近太阳（含日晕）则隐藏
    spr.visible = dx * dx + dy * dy > sunNearPx * sunNearPx
  })
}

function placeCamera() {
  const sp = Math.sin(CAM_INIT_PHI)
  camera.position.set(
    FRAME_TARGET.x + CAM_INIT_RADIUS * sp * Math.cos(CAM_INIT_THETA),
    FRAME_TARGET.y + CAM_INIT_RADIUS * Math.cos(CAM_INIT_PHI),
    FRAME_TARGET.z + CAM_INIT_RADIUS * sp * Math.sin(CAM_INIT_THETA)
  )
  camera.lookAt(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
}

/** 恢复打开时的默认取景（距离 / FOV / 目标 / 角度） */
function resetCamera() {
  if (!camera || !controls) return
  camera.fov = CAM_INIT_FOV
  camera.updateProjectionMatrix()
  placeCamera()
  desiredFocus.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
  focusTarget.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
  controls.target.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
  controls.update()
}

function setupControls(dom) {
  const c = new OrbitControls(camera, dom)
  c.enableDamping = true
  c.dampingFactor = 0.072
  c.enableZoom = true
  c.enablePan = true
  c.enableRotate = true
  c.minDistance = CAM_MIN_DIST
  c.maxDistance = CAM_MAX_DIST
  /* 略慢一点的指数缩放，滚轮可连续滑、不易一下顶到限 */
  c.zoomSpeed = 0.78
  c.rotateSpeed = 0.92
  c.panSpeed = 0.75
  c.screenSpacePanning = true
  c.minPolarAngle = 0.12
  c.maxPolarAngle = Math.PI - 0.12
  c.target.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
  c.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.PAN
  }
  c.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  }
  c.update()
  return c
}

defineExpose({ resetCamera, focusConstellation })

function makeFallbackTex(draw, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** 仅在贴图存在时加入 map，避免 THREE 对 undefined 的警告 */
function withMap(map) {
  return map ? { map } : {}
}

function loadTexture(url, fallback) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(fallback)
      return
    }
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 8
        resolve(tex)
      },
      undefined,
      () => resolve(fallback)
    )
  })
}

function makeOrbitRing(radius, color, opacity, segments = 160) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, -Math.sin(a) * radius))
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, fog: false })
  )
}

function makeGlowSprite(size) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(128, 128, 4, 128, 128, 128)
  g.addColorStop(0, 'rgba(255, 248, 220, 0.95)')
  g.addColorStop(0.18, 'rgba(255, 200, 90, 0.55)')
  g.addColorStop(0.45, 'rgba(255, 140, 50, 0.22)')
  g.addColorStop(0.75, 'rgba(180, 70, 20, 0.06)')
  g.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.95
  })
  const spr = new THREE.Sprite(mat)
  spr.scale.set(size, size, 1)
  return spr
}

/** 行星/天体名：无底描金细字（非节气黑框） */
function makeTextSprite(text, opts = {}) {
  const {
    color = '#E9E4D6',
    fontSize = 26,
    fontWeight = 500,
    fontFamily = '"Noto Serif SC", "Songti SC", "Noto Sans SC", serif',
    paddingX = 10,
    paddingY = 6,
    scale = 1.45
  } = opts
  const dpr = 3
  const probe = document.createElement('canvas').getContext('2d')
  probe.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  const tw = Math.ceil(probe.measureText(text).width)
  const w = tw + paddingX * 2
  const h = fontSize + paddingY * 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(w * dpr))
  canvas.height = Math.max(1, Math.ceil(h * dpr))
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeStyle = 'rgba(6, 12, 18, 0.72)'
  ctx.lineWidth = 3.2
  ctx.strokeText(text, w / 2, h / 2 + 0.5)
  ctx.fillStyle = color
  ctx.fillText(text, w / 2, h / 2 + 0.5)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    fog: false,
    opacity: 1
  })
  const sprite = new THREE.Sprite(mat)
  const aspect = w / h
  sprite.scale.set(aspect * scale, scale, 1)
  sprite.userData.text = text
  sprite.userData.aspect = aspect
  sprite.userData.baseScale = scale
  return sprite
}

/** 黄道节气：CSS2D 无底刻铭（石青/淡金），像浑天仪环旁铭文 */
function makeTermInscribe(jq) {
  const el = document.createElement('div')
  const major = MAJOR_JIE_NAMES.has(jq.name)
  el.className = `term-inscribe${jq.zhong ? ' is-zhong' : ' is-jie'}${major ? ' is-major' : ''}`
  el.textContent = jq.name
  el.setAttribute('aria-hidden', 'true')
  el.addEventListener('pointerdown', (e) => {
    if (!el.classList.contains('is-tapable')) return
    e.stopPropagation()
    onTermLabelActivate(el)
  })
  const obj = new CSS2DObject(el)
  obj.userData.termName = jq.name
  obj.userData.zhong = !!jq.zhong
  obj.userData.major = major
  obj.userData.el = el
  obj.userData.active = false
  return obj
}

/** 星座名：同系无底刻铭，贴在参考星旁 */
function makeSkyInscribe(name) {
  const el = document.createElement('div')
  el.className = 'sky-inscribe'
  el.textContent = name
  el.setAttribute('aria-hidden', 'true')
  const obj = new CSS2DObject(el)
  obj.userData.el = el
  return obj
}

function setTermActive(obj, active) {
  if (!obj?.userData?.el) return
  obj.userData.active = active
  obj.userData.el.classList.toggle('is-active', active)
}

/** 地面视角：观测者所在位置的当地恒星时（度），使用含时刻的精确 JD，播放加速时星空连续转动 */
function localLstDeg() {
  const ymd = civilOfMs(props.currentMs)
  const jd = beijingNoonJD(ymd.y, ymd.m, ymd.d)
  const noonMs = beijingDayStartMs(ymd.y, ymd.m, ymd.d) + 12 * 3600 * 1000
  const jdExact = jd + (props.currentMs - noonMs) / DAY_MS
  return localSiderealDeg(jdExact, props.observerLon)
}

function syncOrbits() {
  if (!earthOrbit || !moon) return

  // 地面：天球恒星时在 animate 里按 currentMs 连续更新；此处只刷节气高亮
  if (props.viewMode === 'ground') {
    highlightTerm(props.currentTerm)
    return
  }

  const earthAng = (props.sunLon + 180) * DEG
  const earthPos = eclipticPos(EARTH_ORBIT_R, earthAng)
  earthOrbit.position.set(earthPos.x, 0, earthPos.z)
  const moonAng = -(props.moonAge / SYNODIC) * Math.PI * 2
  const toSun = new THREE.Vector3(-earthOrbit.position.x, 0, -earthOrbit.position.z).normalize()
  // 锥体默认尖端朝 +Y，对准太阳方向
  if (sunMarker && toSun.lengthSq() > 1e-8) {
    sunMarker.position.copy(toSun).multiplyScalar(1.55)
    sunMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toSun)
  }
  const perp = new THREE.Vector3(-toSun.z, 0, toSun.x)
  const mx = toSun.x * Math.cos(moonAng) + perp.x * Math.sin(moonAng)
  const mz = toSun.z * Math.cos(moonAng) + perp.z * Math.sin(moonAng)
  moon.position.set(mx * MOON_ORBIT_R, 0.2 * Math.sin(moonAng * 2), mz * MOON_ORBIT_R)

  const ymd = civilOfMs(props.currentMs)
  const jd = beijingNoonJD(ymd.y, ymd.m, ymd.d)
  if (planetGroup) {
    planetGroup.children.forEach((node) => {
      const p = node.userData.planet
      if (!p) return
      // 日心黄经 → 与地球同一黄道面方位（尺度压缩，角度按天文近似）
      const ang = planetAngle(jd, p)
      const pp = eclipticPos(p.orbit, ang)
      node.position.set(pp.x, 0, pp.z)
    })
  }
  highlightTerm(props.currentTerm)

  if (skyDome) skyDome.rotation.set(0, 0, 0)
}

/** 地面视角：每渲染帧按精确时刻更新天球，播放加速时连续丝滑 */
function syncGroundSky() {
  if (!skyDome || !groundSceneActive) return
  const lst = localLstDeg()
  skyDome.rotation.set((props.observerLat - 90) * DEG, (lst - 90) * DEG, 0)
}

function highlightTerm(name) {
  if (!termLabelObjects.length || name === lastTermName) return
  lastTermName = name
  termLabelObjects.forEach((obj) => {
    const active = obj.userData.termName === name
    if (obj.userData.active === active) return
    setTermActive(obj, active)
  })
  // 当前节气切到「节」时，立刻从 mute 圆点升为铭文
  updateLabelDensity()
}

function resize() {
  if (!host.value || !renderer || !camera) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  camera.aspect = w / Math.max(h, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
  labelRenderer?.setSize(w, h)
  const pr = Math.min(window.devicePixelRatio || 1, 2)
  twinkleStars.forEach((pts) => {
    if (pts.material?.uniforms?.uPixelRatio) {
      pts.material.uniforms.uPixelRatio.value = pr
    }
  })
  applyEastLabels()
  updateLabelDensity()
}

function animate(now) {
  if (!mountedAlive || !renderer) return
  const dt = Math.min(0.05, (now - lastT) / 1000)
  lastT = now
  simTime += dt
  /* 自转：从北极（局部 +Y）俯视应为逆时针（自西向东）；Three.js 正 Y 为顺时针，顺行取负 */
  if (earth) earth.rotation.y -= dt * 0.85
  if (moon) moon.rotation.y -= dt * 0.32
  if (sun) sun.rotation.y -= dt * 0.04
  sunGlowLayers.forEach((g, i) => {
    const pulse = 1 + 0.035 * Math.sin(now * 0.0018 + i)
    g.scale.setScalar(g.userData.baseScale * pulse)
  })
  if (planetGroup) {
    planetGroup.children.forEach((n) => {
      if (!n.userData.spin) return
      const retro = n.userData.planet?.retrogradeSpin
      const sign = retro ? 1 : -1
      n.rotation.y += sign * dt * n.userData.spin
    })
  }
  twinkleStars.forEach((pts) => {
    if (pts.material?.uniforms?.uTime) {
      pts.material.uniforms.uTime.value = simTime
    }
  })
  if (asteroidBelt) updateAsteroidBelt(asteroidBelt, dt)
  comets.forEach((c) => updateComet(c, simTime))
  if (nebulaSprites) {
    nebulaSprites.children.forEach((spr, i) => {
      const d = spr.userData.drift || 0.15
      spr.position.x += Math.sin(simTime * d + i) * 0.008
      spr.position.y += Math.cos(simTime * d * 0.8 + i) * 0.006
    })
  }
  controls?.update()
  focusTarget.lerp(desiredFocus, Math.min(1, dt * 2.2))
  if (controls && props.viewMode !== 'ground') {
    controls.target.lerp(focusTarget, Math.min(1, dt * 2.2))
  }
  syncGroundSky()
  updateGroundHud()
  labelCullClock += dt
  if (labelCullClock >= 0.12) {
    labelCullClock = 0
    updateLabelDensity()
  }
  renderer.render(scene, camera)
  labelRenderer?.render(scene, camera)
  animId = requestAnimationFrame(animate)
}

/** 地面水平环（地景视角下标示地平线） */
function makeGroundHorizon() {
  const g = new THREE.Group()
  g.visible = false

  // 半透明圆盘：以原点为中心，模拟大地
  const diskGeo = new THREE.RingGeometry(30, 70, 64)
  const diskMat = new THREE.MeshBasicMaterial({
    color: 0x1a2230,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const disk = new THREE.Mesh(diskGeo, diskMat)
  disk.rotation.x = -Math.PI / 2
  disk.position.y = -0.5
  g.add(disk)

  // 地平线亮环
  const ringGeo = new THREE.RingGeometry(28.5, 30, 64)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x405060,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = -0.2
  g.add(ring)

  return g
}

function buildConstellationLayer(parent, layer, tier) {
  CONSTELLATIONS.filter((c) => {
    if ((c.layer || 'west') !== layer) return false
    if (tier && (c.tier || 'major') !== tier) return false
    return true
  }).forEach((c) => {
    if (constellationMap.has(c.name)) return
    const quiet = c.tier === 'minor' || c.tier === 'extra'
    const dim = quiet && c.label === false
    const starOp = dim ? 0.55 : quiet ? 0.72 : 0.96
    const haloOp = dim ? 0.07 : quiet ? 0.12 : 0.22
    const lineOp = dim ? 0.26 : quiet ? 0.42 : 0.78
    const dirs = c.stars.map(([ra, dec, sz]) => ({
      dir: raDecToVec(ra, dec, 1).normalize(),
      sz: (sz || 1.2) * (dim ? 0.78 : quiet ? 0.88 : 1)
    }))
    const center = new THREE.Vector3()
    dirs.forEach((p) => center.add(p.dir))
    if (center.lengthSq() > 1e-8) center.normalize()
    else center.set(1, 0, 0)
    const pts = dirs.map((p) => ({
      v: p.dir
        .clone()
        .lerp(center, 1 - CONSTELLATION_SPAN)
        .normalize()
        .multiplyScalar(SKY_R),
      sz: p.sz
    }))
    const entry = {
      stars: [],
      halos: [],
      lines: [],
      label: null,
      center: pts[0]?.v?.clone() || new THREE.Vector3(),
      layer,
      quiet
    }
    if (pts.length > 1) {
      entry.center = new THREE.Vector3()
      pts.forEach((p) => entry.center.add(p.v))
      entry.center.divideScalar(pts.length)
    }
    pts.forEach((p) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.28 * p.sz, 12, 12),
        new THREE.MeshBasicMaterial({
          color: c.color,
          transparent: true,
          opacity: starOp,
          fog: false,
          depthWrite: false
        })
      )
      m.position.copy(p.v)
      m.renderOrder = -3
      m.userData.constellation = c
      if (c.culture) culturePickMeshes.push(m)
      parent.add(m)
      entry.stars.push(m)
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 * p.sz, 10, 10),
        new THREE.MeshBasicMaterial({
          color: c.color,
          transparent: true,
          opacity: haloOp,
          depthWrite: false,
          fog: false,
          blending: THREE.AdditiveBlending
        })
      )
      halo.position.copy(p.v)
      halo.renderOrder = -3
      parent.add(halo)
      entry.halos.push(halo)
    })
    c.lines.forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([pts[a].v, pts[b].v])
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: c.color,
          transparent: true,
          opacity: lineOp,
          fog: false,
          depthWrite: false
        })
      )
      line.renderOrder = -3
      parent.add(line)
      entry.lines.push(line)
    })
    const showLabel = c.label !== false && c.tier !== 'minor'
    let label = null
    if (showLabel) {
      const li = c.labelAt ?? 0
      label = makeSkyInscribe(c.name)
      if (quiet) label.userData.el.classList.add('is-quiet')
      const anchor = pts[Math.min(li, pts.length - 1)].v.clone()
      label.position.copy(anchor).multiplyScalar(1.018)
      label.position.y += 0.45
      if (c.culture) {
        label.userData.constellation = c
        const el = label.userData.el
        el.classList.add('is-clickable')
        el.setAttribute('role', 'button')
        el.setAttribute('tabindex', '0')
        el.setAttribute('aria-label', `${c.name} 星官故事`)
        el.addEventListener('click', (ev) => {
          ev.stopPropagation()
          openCulture(c)
        })
        el.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault()
            openCulture(c)
          }
        })
      }
      parent.add(label)
      if (layer === 'east') eastLabelObjects.push(label)
      else if (layer === 'west') westLabelObjects.push(label)
    }
    entry.label = label
    constellationMap.set(c.name, entry)
  })
  applyConstellationHighlight()
}

async function buildPlanets(parent, texMap) {
  const compact = isCompactLabels()
  for (const p of PLANETS) {
    const ringOp = p.dwarf ? 0.28 : 0.42
    parent.add(makeOrbitRing(p.orbit, p.dwarf ? 0x6a6050 : 0x5a6878, ringOp))
    const body = new THREE.Group()
    body.userData.planet = p
    body.userData.spin = 0.35 + Math.random() * 0.45
    const map = texMap[p.id] || null
    const segs = p.dwarf ? 24 : 48
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.size, segs, segs),
      new THREE.MeshStandardMaterial({
        ...withMap(map),
        color: map ? 0xffffff : p.color,
        roughness: 0.48,
        metalness: 0.08,
        emissive: p.color,
        emissiveIntensity: p.dwarf ? 0.28 : 0.22
      })
    )
    body.add(mesh)
    if (p.rings) {
      const ringMap = texMap.saturnRing || null
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(p.size * 1.35, p.size * 2.35, 96),
        new THREE.MeshBasicMaterial({
          ...withMap(ringMap),
          color: ringMap ? 0xffffff : 0xc9b896,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          ...(ringMap ? { alphaMap: ringMap } : {})
        })
      )
      ring.rotation.x = Math.PI / 2.35
      body.add(ring)
    }
    // 窄屏用短名（避免「水星·水」贴日）；桌面保留五行后缀
    const labelText = compact || !p.wuxing ? p.name : `${p.name} · ${p.wuxing}`
    const label = makeTextSprite(labelText, {
      color: p.dwarf ? '#C8B898' : '#D8D2C4',
      fontSize: p.dwarf ? (compact ? 14 : 16) : compact ? 16 : 20,
      fontWeight: 500,
      scale: p.dwarf ? (compact ? 0.95 : 1.15) : compact ? 1.05 : 1.4
    })
    label.position.set(0, p.size + (p.dwarf ? 0.7 : 0.85), 0)
    label.userData.isPlanetLabel = true
    label.userData.planetId = p.id
    label.userData.planetOrbit = p.orbit
    body.userData.labelSprite = label
    body.add(label)
    bodyLabelSprites.push(label)
    parent.add(body)
  }
}

onMounted(async () => {
  mountedAlive = true

  if (!WebGL.isWebGLAvailable()) {
    const msg = WebGL.getWebGLErrorMessage()
    host.value?.appendChild(msg)
    return
  }

  scene = new THREE.Scene()
  // 外行星轨道远，雾过浓会吞掉星点与星座；仅作极淡景深
  scene.fog = new THREE.FogExp2(0x0a121a, 0.00135)
  scene.background = new THREE.Color(0x080e16)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x080e16, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.32

  labelRenderer = new CSS2DRenderer()
  scrubCtx.labelRenderer = labelRenderer
  labelRenderer.setSize(host.value.clientWidth, host.value.clientHeight)
  labelRenderer.domElement.className = 'orbit-labels'
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelRenderer.domElement.style.zIndex = '0'
  host.value.appendChild(labelRenderer.domElement)

  // far 需覆盖天球星点与外行星；默认 FOV 配合距离收黄道可读全圈
  camera = new THREE.PerspectiveCamera(CAM_INIT_FOV, 1, 0.1, 1200)
  scrubCtx.camera = camera
  placeCamera()
  controls = setupControls(host.value)
  scrubCtx.controls = controls

  if (document.fonts?.ready) {
    try {
      await document.fonts.load('500 28px "Noto Serif SC"')
      await document.fonts.ready
    } catch {
      /* ignore */
    }
  }
  if (!mountedAlive) return

  // 天球容器：地景视角下整体旋转以匹配当地恒星时
  skyDome = new THREE.Group()
  scene.add(skyDome)

  // 岁差容器：整片恒星场（星点/银河带/星座/星云）绕北黄极轴缓慢进动
  skyRoot = new THREE.Group()
  skyDome.add(skyRoot)

  // 天球壳大于最远星点与相机拉远上限，BackSide 从内侧看
  skyRoot.add(makeNebulaShell(230))
  nebulaSprites = makeNebulaSprites()
  nebulaSprites.renderOrder = -18
  skyRoot.add(nebulaSprites)

  // 星点壳在相机最大半径之外，任意环视都仍在球内看满天星
  twinkleStars = [
    makeStarField(7200, 145, 230, 0xe8ecee, 1.2, 0.88),
    makeStarField(2600, 150, 235, 0xb0c8d4, 1.55, 0.72),
    makeStarField(1200, 155, 240, 0xe8d8b8, 2.1, 0.55),
    makeStarField(260, 148, 225, 0xf2f4f5, 3.5, 0.9, { crossed: true }),
    makeGalaxyBand(900, 175)
  ]
  twinkleStars.forEach((s) => skyRoot.add(s))

  // 地面水平环（地景视角，默认隐藏）
  groundHorizon = makeGroundHorizon()
  scene.add(groundHorizon)

  // 小行星带：夹在压缩后的火星(24.4)与木星(32.5)轨道之间
  asteroidBelt = makeAsteroidBelt(7200, 26.2, 30.8)
  scene.add(asteroidBelt)

  // 高倾角细尾彗星；半长轴避开外行星黄道面标签
  comets = [
    createComet({
      a: 74,
      e: 0.78,
      incl: 1.18,
      omega: 1.55,
      period: 180,
      phase: 0.55,
      color: 0xb0d4e0,
      name: '彗星'
    })
  ]
  comets.forEach((c) => {
    scene.add(c)
    updateComet(c, 0)
  })

  skyWestGroup = new THREE.Group()
  skyEastGroup = new THREE.Group()
  skyEastExtraGroup = new THREE.Group()
  skyRoot.add(skyWestGroup)
  skyRoot.add(skyEastGroup)
  skyEastGroup.add(skyEastExtraGroup)
  eastLabelObjects = []
  westLabelObjects = []
  culturePickMeshes.length = 0
  scrubCtx.culturePickMeshes = culturePickMeshes
  buildConstellationLayer(skyWestGroup, 'west')
  buildConstellationLayer(skyEastGroup, 'east', 'core')
  // 古象繁（约 283 星官）通过 applyConstellationMode 动态加载
  applyConstellationMode()

  // —— 岁差：惯性标记 + 极星参照标签 + 初始历元 ——
  buildPrecessionMarkers()
  applyPrecession()

  const sunFallback = makeFallbackTex((ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.5, s * 0.5, 2, s * 0.5, s * 0.5, s * 0.5)
    g.addColorStop(0, '#fff8e0')
    g.addColorStop(0.35, '#f0b040')
    g.addColorStop(1, '#c04020')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
  }, 256)

  const earthFallback = makeFallbackTex((ctx, s) => {
    ctx.fillStyle = '#1a5a8a'
    ctx.fillRect(0, 0, s, s)
  }, 64)
  const moonFallback = makeFallbackTex((ctx, s) => {
    ctx.fillStyle = '#a8a49a'
    ctx.fillRect(0, 0, s, s)
  }, 64)

  const [
    sunTex,
    earthTex,
    earthNormal,
    earthSpec,
    moonTex,
    mercuryTex,
    venusTex,
    marsTex,
    jupiterTex,
    saturnTex,
    saturnRing
  ] = await Promise.all([
    loadTexture('/textures/sun.jpg', sunFallback),
    loadTexture('/textures/earth.jpg', earthFallback),
    loadTexture('/textures/earth_normal.jpg', null),
    loadTexture('/textures/earth_specular.jpg', null),
    loadTexture('/textures/moon.jpg', moonFallback),
    loadTexture('/textures/mercury.jpg', null),
    loadTexture('/textures/venus.jpg', null),
    loadTexture('/textures/mars.jpg', null),
    loadTexture('/textures/jupiter.jpg', null),
    loadTexture('/textures/saturn.jpg', null),
    loadTexture('/textures/saturn_ring.png', null)
  ])
  if (!mountedAlive) return

  sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.55, 64, 64),
    new THREE.MeshBasicMaterial({ map: sunTex })
  )
  scene.add(sun)

  const corona = makeGlowSprite(14)
  corona.userData.baseScale = 14
  scene.add(corona)
  sunGlowLayers.push(corona)

  const glowMid = new THREE.Mesh(
    new THREE.SphereGeometry(3.6, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffb050,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  glowMid.userData.baseScale = 1
  scene.add(glowMid)
  sunGlowLayers.push(glowMid)

  const glowOuter = new THREE.Mesh(
    new THREE.SphereGeometry(5.6, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff7030,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  glowOuter.userData.baseScale = 1
  scene.add(glowOuter)
  sunGlowLayers.push(glowOuter)

  const glowFar = new THREE.Mesh(
    new THREE.SphereGeometry(8.2, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xc04018,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  glowFar.userData.baseScale = 1
  scene.add(glowFar)
  sunGlowLayers.push(glowFar)

  const sunLight = new THREE.PointLight(0xffe0c0, 340, 190, 1.55)
  scene.add(sunLight)
  scene.add(new THREE.AmbientLight(0x6a7a88, 0.58))
  scene.add(new THREE.HemisphereLight(0xb8c8d0, 0x121820, 0.48))
  const fill = new THREE.DirectionalLight(0x9ab0bc, 0.32)
  fill.position.set(-20, 30, 10)
  scene.add(fill)
  const warmFill = new THREE.DirectionalLight(0xc88860, 0.16)
  warmFill.position.set(25, 10, -15)
  scene.add(warmFill)

  const ecliptic = new THREE.Mesh(
    new THREE.RingGeometry(6.5, 39, 96),
    new THREE.MeshBasicMaterial({
      color: 0x3a5060,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.14
    })
  )
  ecliptic.rotation.x = -Math.PI / 2
  scene.add(ecliptic)

  scene.add(makeOrbitRing(EARTH_ORBIT_R, 0xa0aab4, 0.8))

  const termGroup = new THREE.Group()
  scene.add(termGroup)
  termLabelObjects = []
  for (let i = 0; i < 24; i++) {
    const jq = JIEQI[i]
    const a = (jq.lon + 180) * DEG
    const len = jq.zhong ? 1.85 : 1.15
    const r0 = EARTH_ORBIT_R - 0.12
    const r1 = EARTH_ORBIT_R + len
    const p0 = eclipticPos(r0, a)
    const p1 = eclipticPos(r1, a)
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(p0.x, 0, p0.z),
      new THREE.Vector3(p1.x, 0, p1.z)
    ])
    termGroup.add(
      new THREE.Line(
        g,
        new THREE.LineBasicMaterial({
          color: jq.zhong ? 0xc9a86a : 0x5a8a8c,
          transparent: true,
          opacity: jq.zhong ? 0.9 : 0.55,
          fog: false
        })
      )
    )
    const label = makeTermInscribe(jq)
    // 刻度外侧略抬高，字贴黄道环旁、不压轨道
    const lr = EARTH_ORBIT_R + len + 1.35
    const lp = eclipticPos(lr, a)
    label.position.set(lp.x, 0.08, lp.z)
    termGroup.add(label)
    termLabelObjects.push(label)
  }

  earthOrbit = new THREE.Group()
  scene.add(earthOrbit)

  sunMarker = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.7, 10),
    new THREE.MeshBasicMaterial({ color: 0xc8a858 })
  )
  earthOrbit.add(sunMarker)

  const earthTilt = new THREE.Group()
  earthTilt.rotation.z = 23.44 * DEG
  earthOrbit.add(earthTilt)

  const earthMat = new THREE.MeshStandardMaterial({
    ...withMap(earthTex),
    roughness: 0.55,
    metalness: 0.08,
    emissive: new THREE.Color(0x102030),
    emissiveIntensity: 0.15
  })
  if (earthNormal) {
    earthMat.normalMap = earthNormal
    earthMat.normalScale = new THREE.Vector2(0.85, 0.85)
  }
  if (earthSpec) {
    earthMat.roughnessMap = earthSpec
    earthMat.metalnessMap = earthSpec
  }
  earth = new THREE.Mesh(new THREE.SphereGeometry(1.28, 64, 64), earthMat)
  earthTilt.add(earth)

  const atmos = new THREE.Mesh(
    new THREE.SphereGeometry(1.34, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x6ab0e0,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    })
  )
  earthTilt.add(atmos)

  const moonOrbit = new THREE.Group()
  earthOrbit.add(moonOrbit)
  moonOrbit.add(makeOrbitRing(MOON_ORBIT_R, 0x6a9098, 0.58))

  moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 48, 48),
    new THREE.MeshStandardMaterial({
      ...withMap(moonTex),
      roughness: 0.92,
      metalness: 0.02,
      emissive: new THREE.Color(0x222018),
      emissiveIntensity: 0.08
    })
  )
  moonOrbit.add(moon)

  const earthLabel = makeTextSprite('地球', {
    color: '#D0DCE0',
    fontSize: isCompactLabels() ? 18 : 22,
    fontWeight: 500,
    scale: isCompactLabels() ? 1.05 : 1.4
  })
  earthLabel.position.set(0, 2.0, 0)
  earthLabel.userData.isPlanetLabel = true
  earthLabel.userData.planetId = 'earth'
  earthOrbit.add(earthLabel)
  bodyLabelSprites = [earthLabel]

  planetGroup = new THREE.Group()
  scene.add(planetGroup)
  await buildPlanets(planetGroup, {
    mercury: mercuryTex,
    venus: venusTex,
    mars: marsTex,
    jupiter: jupiterTex,
    saturn: saturnTex,
    saturnRing
  })
  if (!mountedAlive) return

  syncOrbits()
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(host.value)
  window.visualViewport?.addEventListener('resize', resize)
  window.visualViewport?.addEventListener('scroll', resize)
  window.addEventListener('orientationchange', resize)
  lastT = performance.now()
  animId = requestAnimationFrame(animate)

  /* 拨日用捕获；旋转/缩放/平移由 OrbitControls 接管（仅挂在 3D host） */
  const h = host.value
  h.addEventListener('pointerdown', scrub.eventHandlers.onPointerDownCapture, true)
  h.addEventListener('pointermove', scrub.eventHandlers.onPointerMove)
  h.addEventListener('pointerup', scrub.eventHandlers.onPointerUp)
  h.addEventListener('pointercancel', scrub.eventHandlers.onPointerUp)
  h.addEventListener('contextmenu', scrub.eventHandlers.onContextMenu)

  // 初始视角
  applyViewMode()
})

onBeforeUnmount(() => {
  mountedAlive = false
  clearTermReveal()
  cancelAnimationFrame(animId)
  ro?.disconnect()
  window.visualViewport?.removeEventListener('resize', resize)
  window.visualViewport?.removeEventListener('scroll', resize)
  window.removeEventListener('orientationchange', resize)
  scrub.cleanup()
  if (host.value) {
    const h = host.value
    h.removeEventListener('pointerdown', scrub.eventHandlers.onPointerDownCapture, true)
    h.removeEventListener('pointermove', scrub.eventHandlers.onPointerMove)
    h.removeEventListener('pointerup', scrub.eventHandlers.onPointerUp)
    h.removeEventListener('pointercancel', scrub.eventHandlers.onPointerUp)
    h.removeEventListener('contextmenu', scrub.eventHandlers.onContextMenu)
    if (labelRenderer?.domElement?.parentNode === host.value) {
      host.value.removeChild(labelRenderer.domElement)
    }
  }
  controls?.dispose()
  controls = null
  termLabelObjects = []
  bodyLabelSprites = []
  labelRenderer = null
  // 递归释放场景中所有 GPU 资源
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh || child.isPoints || child.isLine) {
        child.geometry?.dispose()
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((mat) => {
            // 释放纹理
            if (mat.map) mat.map.dispose()
            if (mat.alphaMap) mat.alphaMap.dispose()
            if (mat.normalMap) mat.normalMap.dispose()
            if (mat.roughnessMap) mat.roughnessMap.dispose()
            if (mat.metalnessMap) mat.metalnessMap.dispose()
            if (mat.emissiveMap) mat.emissiveMap.dispose()
            if (mat.aoMap) mat.aoMap.dispose()
            mat.dispose()
          })
        }
      }
    })
  }
  renderer?.dispose()
})

watch(() => [props.sunLon, props.moonAge, props.currentTerm, props.observerLat, props.observerLon], syncOrbits)
// 地面 currentMs → animate 内 syncGroundSky；轨道行星跟 sunLon/moonAge/日期读数
watch(() => props.constellationMode, applyConstellationMode)
watch(() => props.eastLabels, () => {
  applyEastLabels()
  applyConstellationHighlight()
})
watch(() => props.highlightNames, applyConstellationHighlight, { deep: true })
watch(() => props.compactLabels, () => {
  applyEastLabels()
  updateLabelDensity()
})
watch(() => props.viewMode, (_new, _old) => { applyViewMode() })
watch(() => props.epochYear, applyPrecession)

/** 视角切换：orbit ↔ ground */
function applyViewMode() {
  if (!camera || !controls || !host.value) return
  const ground = props.viewMode === 'ground'

  // 地面场景内部标记（给同步循环用）
  groundSceneActive = ground

  // 地面水平环
  if (groundHorizon) groundHorizon.visible = ground

  if (ground) {
    // 保存轨道视角的相机状态，后续可以恢复
    // 将相机置于原点，抬头望天
    camera.position.set(0, 0, 0)
    controls.target.set(0, 10, 0)
    controls.update()
    // 限制仰角范围：0°（天顶）~ 85°（接近地平线），不看到脚下
    controls.minPolarAngle = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.02
    controls.minDistance = 0.5
    controls.maxDistance = 10
    controls.enablePan = false
    // 隐藏太阳系元素
    if (earthOrbit) earthOrbit.visible = false
    if (planetGroup) planetGroup.visible = false
    if (sun) sun.visible = false
    if (asteroidBelt) asteroidBelt.visible = false
    if (comets) comets.forEach((c) => { c.visible = false })
    // 同步天球旋转
    syncOrbits()
  } else {
    // 恢复轨道视角
    resetCamera()
    controls.minPolarAngle = 0.12
    controls.maxPolarAngle = Math.PI - 0.12
    controls.enablePan = true
    controls.minDistance = CAM_MIN_DIST
    controls.maxDistance = CAM_MAX_DIST
    controls.target.set(FRAME_TARGET.x, FRAME_TARGET.y, FRAME_TARGET.z)
    controls.update()
    // 恢复太阳系元素
    if (earthOrbit) earthOrbit.visible = true
    if (planetGroup) planetGroup.visible = true
    if (sun) sun.visible = true
    if (asteroidBelt) asteroidBelt.visible = true
    if (comets) comets.forEach((c) => { c.visible = true })
    // 恢复天球旋转
    syncOrbits()
  }
}

/* —— 岁差标记与极星参照 —— */
const POLE_REF_TEXT = {
  勾陈一: '勾陈一 · 今极星',
  右枢: '右枢 · 前28世纪极星',
  织女一: '织女一 · 13—15千纪近极'
}

function makeMiniDot(color, r = 0.55) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 16, 16),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      fog: false
    })
  )
}

function makeMiniHalo(color, r = 1.5, opacity = 0.16) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 16, 16),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      fog: false,
      blending: THREE.AdditiveBlending
    })
  )
}

/** 岁差专用铭文标签（标出极星更替的参照星） */
function makePoleInscribe(text, cls) {
  const label = makeSkyInscribe(text)
  if (cls) label.userData.el.classList.add(cls)
  return label
}

/**
 * 岁差惯性标记：
 * - 极路径环（约 2.6 万年一周的北天极轨迹）与三颗极星参照 → 挂星场组，随进动旋转；
 * - 北天极 / 北黄极 / 冬至·星空 标记 → 钉在惯性天球，星场在其下滑动。
 */
function buildPrecessionMarkers() {
  // 极路径环：北天极绕北黄极一圈的轨迹（星场坐标，随星场进动）
  const circlePts = []
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * Math.PI * 2
    circlePts.push(POLE_DIR.clone().applyAxisAngle(NEP_V3, a).multiplyScalar(SKY_R))
  }
  const poleCircle = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circlePts),
    new THREE.LineBasicMaterial({
      color: 0x3a6a72,
      transparent: true,
      opacity: 0.3,
      fog: false,
      depthWrite: false
    })
  )
  poleCircle.renderOrder = -4
  skyRoot.add(poleCircle)

  // 三颗极星永久参照（静态星场坐标）
  POLE_STARS.forEach((s) => {
    const label = makePoleInscribe(POLE_REF_TEXT[s.name] || s.name, 'is-ref')
    const dir = raDecToVec(s.ra, s.dec, 1)
    label.position.copy(dir).multiplyScalar(SKY_R * 1.02)
    skyRoot.add(label)
  })

  // 北天极：亮珠 + 光晕 + 动态「近XX」铭文（钉在惯性天球，恒为周日旋转中心）
  const poleDot = makeMiniDot(0xa8ecf4)
  poleDot.position.set(0, SKY_R, 0)
  skyDome.add(poleDot)
  const poleHalo = makeMiniHalo(0x6ad4dc, 1.6, 0.18)
  poleHalo.position.set(0, SKY_R, 0)
  skyDome.add(poleHalo)
  poleCaptionLabel = makePoleInscribe('北天极 · 近勾陈一', 'is-pole')
  poleCaptionLabel.position.set(0, SKY_R + 2.8, 0)
  skyDome.add(poleCaptionLabel)

  // 北黄极（天球局部 (0, cosε, −sinε)）：近似固定参照
  const nepDir = NEP_V3.clone()
  const nepDot = makeMiniDot(0xd8b05a, 0.4)
  nepDot.position.copy(nepDir).multiplyScalar(SKY_R)
  skyDome.add(nepDot)
  const nepLabel = makePoleInscribe('北黄极', 'is-tag')
  nepLabel.position.copy(nepDir).multiplyScalar(SKY_R * 1.04)
  nepLabel.position.y += 1.2
  skyDome.add(nepLabel)

  // 冬至·星空：历法冬至点在恒星背景里的固定方向，星场于其下西移
  const solDir = SOLSTICE_DIR.clone()
  const solDot = makeMiniDot(0xe8a05a, 0.45)
  solDot.position.copy(solDir).multiplyScalar(SKY_R)
  skyDome.add(solDot)
  const solLabel = makePoleInscribe('冬至 · 星空', 'is-tag')
  solLabel.position.copy(solDir).multiplyScalar(SKY_R * 1.05)
  skyDome.add(solLabel)
}

/**
 * 岁差：星场整体绕 J2000 北黄极轴进动到观测历元。
 * θ<0（过去）时星场顺时针回旋，使对应年的极星恰好移到钉在天球上的「北天极」标记处。
 */
function applyPrecession() {
  if (!skyRoot) return
  const thetaRad = accumulatedPrecessionDeg(props.epochYear) * DEG
  skyRoot.quaternion.setFromAxisAngle(NEP_V3, -thetaRad)
  if (poleCaptionLabel?.userData?.el) {
    const near = nearestPoleStar(props.epochYear)
    poleCaptionLabel.userData.el.textContent = near
      ? `北天极 · 近${near.name}（${near.distDeg.toFixed(1)}°）`
      : `北天极 · 极星漂移中`
  }
}

/* —— 屏幕方位罗盘 HUD —— */
const hudNeedleRef = ref(null)
const hudReadoutRef = ref(null)
let lastHudText = ''
let lastHudAz = -1

/**
 * 由相机朝向计算地平坐标（方位角 Az 自北顺时针 / 高度 Alt），并刷新罗盘 HUD。
 * 与场景天球旋转严格互逆（R = Rx(φ-90°)·Ry(lst-90°)），保证读数与所见一致。
 */
function updateGroundHud() {
  if (!groundSceneActive || !camera || !hudNeedleRef.value || !hudReadoutRef.value) return
  const phi = props.observerLat * DEG
  const lst = localLstDeg() * DEG
  const forward = new THREE.Vector3()
  camera.getWorldDirection(forward)
  // 逆变换到天球静止系：s = Ry(90°-lst) · Rx(90°-φ) · forward
  const s = forward.clone().applyAxisAngle(AX_X, Math.PI / 2 - phi).applyAxisAngle(AX_Y, Math.PI / 2 - lst)
  const ra = Math.atan2(s.z, s.x)
  const dec = Math.asin(THREE.MathUtils.clamp(s.y, -1, 1))
  let h = lst - ra
  h = ((h + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
  const cd = Math.cos(dec)
  const sd = Math.sin(dec)
  const sinAlt = sd * Math.sin(phi) + cd * Math.cos(phi) * Math.cos(h)
  const alt = Math.asin(THREE.MathUtils.clamp(sinAlt, -1, 1))
  const cosAlt = Math.cos(alt)
  let az = null
  if (cosAlt > 1e-4) {
    az = Math.atan2(-cd * Math.sin(h), sd * Math.cos(phi) - cd * Math.sin(phi) * Math.cos(h))
  }
  const altDeg = alt / DEG
  let text
  let needleDeg
  if (az == null || altDeg > 82) {
    text = `天顶 · 高度 ${altDeg.toFixed(0)}°`
    needleDeg = lastHudAz >= 0 ? lastHudAz : 0
  } else {
    const azDeg = ((az / DEG) % 360 + 360) % 360
    const name = AZ_NAMES[Math.round(azDeg / 22.5) % 16]
    text = `${name} · 方位 ${azDeg.toFixed(0)}° · 高度 ${altDeg.toFixed(0)}°`
    needleDeg = azDeg
  }
  if (text !== lastHudText) {
    hudReadoutRef.value.textContent = text
    lastHudText = text
  }
  if (Math.abs(needleDeg - lastHudAz) > 0.3) {
    hudNeedleRef.value.setAttribute('transform', `rotate(${needleDeg.toFixed(1)} 60 60)`)
    lastHudAz = needleDeg
  }
}
</script>

<template>
  <div ref="host" class="orbit-host">
    <canvas ref="canvas" class="orbit-canvas" />
    <div class="scrub-toast" aria-hidden="true">拨日</div>
    <div v-show="viewMode === 'ground'" class="ground-hud" aria-hidden="true">
      <div class="hud-compass">
        <svg class="hud-svg" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="56" class="hud-bg" />
          <line
            v-for="t in HUD_TICKS"
            :key="t.az"
            :x1="t.x1"
            :y1="t.y1"
            :x2="t.x2"
            :y2="t.y2"
            :class="['hud-tick', { major: t.major }]"
          />
          <text v-for="c in HUD_CARDINALS" :key="c.az" :x="c.x" :y="c.y" class="hud-cardinal">{{ c.name }}</text>
          <g ref="hudNeedleRef" class="hud-needle">
            <line x1="60" y1="60" x2="60" y2="15" />
          </g>
          <circle cx="60" cy="60" r="3.4" class="hud-hub" />
        </svg>
        <div ref="hudReadoutRef" class="hud-readout"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orbit-host {
  position: absolute;
  inset: 0;
  z-index: 0;
  isolation: isolate;
  cursor: grab;
  touch-action: none;
  background: transparent;
}
.orbit-host:active {
  cursor: grabbing;
}
.orbit-host.is-scrubbing {
  cursor: ew-resize;
}
.orbit-host.scrub-engaged .scrub-toast {
  opacity: 1;
  transform: translate(-50%, 0);
}
.scrub-toast {
  position: absolute;
  left: 50%;
  top: calc(0.85rem + var(--safe-top));
  z-index: 2;
  transform: translate(-50%, -0.35rem);
  padding: 0.32rem 0.72rem;
  border: 1px solid rgba(184, 150, 74, 0.45);
  border-radius: 999px;
  background: rgba(8, 14, 22, 0.88);
  color: var(--dan-jin);
  font-family: var(--font-sans);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.orbit-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

<!-- CSS2D 铭文挂在 host 下，需非 scoped 才能命中 -->
<style>
.orbit-labels .term-inscribe {
  font-family: 'Noto Serif SC', 'Songti SC', 'Noto Sans SC', serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.42em;
  color: rgba(118, 156, 158, 0.92);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  line-height: 1;
  padding: 0 0 0 0.42em;
  margin: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke: 0.45px rgba(8, 14, 22, 0.55);
  paint-order: stroke fill;
  text-shadow: 0 1px 2px rgba(6, 10, 16, 0.55);
}
.orbit-labels .term-inscribe.is-zhong {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.46em;
  padding-left: 0.46em;
  color: rgba(201, 168, 104, 0.95);
  -webkit-text-stroke: 0.4px rgba(8, 14, 22, 0.5);
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.5),
    0 0 6px rgba(184, 150, 74, 0.16);
}
.orbit-labels .term-inscribe.is-active {
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.48em;
  padding-left: 0.48em;
  color: #ebdaa8;
  -webkit-text-stroke: 0.35px rgba(20, 16, 8, 0.35);
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.45),
    0 0 10px rgba(184, 150, 74, 0.38);
}
.orbit-labels .term-inscribe.is-active.is-zhong {
  font-size: 15px;
  color: #f0e0b0;
}

.orbit-labels .sky-inscribe {
  font-family: 'Noto Serif SC', 'Songti SC', 'Noto Sans SC', serif;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.36em;
  color: rgba(196, 188, 168, 0.88);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  line-height: 1;
  padding: 0 0 0 0.36em;
  margin: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke: 0.4px rgba(8, 14, 22, 0.52);
  paint-order: stroke fill;
  text-shadow: 0 1px 2px rgba(6, 10, 16, 0.5);
}
.orbit-labels .sky-inscribe.is-quiet {
  font-size: 10px;
  letter-spacing: 0.28em;
  color: rgba(176, 168, 148, 0.62);
  -webkit-text-stroke: 0.3px rgba(8, 14, 22, 0.4);
}
.orbit-labels .sky-inscribe.is-clickable {
  pointer-events: auto;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.orbit-labels .sky-inscribe.is-clickable:hover,
.orbit-labels .sky-inscribe.is-clickable:focus-visible {
  color: rgba(235, 218, 168, 0.98);
  outline: none;
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.45),
    0 0 8px rgba(184, 150, 74, 0.22);
}
.orbit-labels .sky-inscribe.is-active {
  color: rgba(235, 218, 168, 0.98);
  font-weight: 600;
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.45),
    0 0 10px rgba(184, 150, 74, 0.28);
}
.orbit-labels .sky-inscribe.is-dim {
  opacity: 0.42;
}
.orbit-labels .sky-inscribe.is-pole {
  color: rgba(168, 233, 240, 0.96);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.22em;
  padding-left: 0.22em;
  -webkit-text-stroke: 0.45px rgba(8, 14, 22, 0.7);
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.6),
    0 0 8px rgba(90, 210, 220, 0.28);
}
.orbit-labels .sky-inscribe.is-ref {
  font-size: 10px;
  letter-spacing: 0.24em;
  padding-left: 0.24em;
  color: rgba(190, 210, 216, 0.7);
  -webkit-text-stroke: 0.35px rgba(8, 14, 22, 0.55);
}
.orbit-labels .sky-inscribe.is-tag {
  font-size: 10px;
  letter-spacing: 0.24em;
  padding-left: 0.24em;
  color: rgba(160, 208, 196, 0.8);
  -webkit-text-stroke: 0.35px rgba(8, 14, 22, 0.55);
}

@media (max-width: 720px) {
  .orbit-labels .term-inscribe {
    font-size: 10px;
    letter-spacing: 0.32em;
    padding-left: 0.32em;
  }
  .orbit-labels .term-inscribe.is-zhong {
    font-size: 11px;
    letter-spacing: 0.34em;
    padding-left: 0.34em;
  }
  .orbit-labels .term-inscribe.is-active {
    font-size: 11.5px;
    letter-spacing: 0.36em;
    padding-left: 0.36em;
  }
  .orbit-labels .term-inscribe.is-active.is-zhong {
    font-size: 12px;
  }
  .orbit-labels .sky-inscribe {
    font-size: 9.5px;
    letter-spacing: 0.28em;
    padding-left: 0.28em;
  }
  .orbit-labels .sky-inscribe.is-quiet {
    font-size: 8.5px;
    letter-spacing: 0.22em;
  }
}

/* JS compactLabels 或窄屏类：进一步降密（与 media 互补） */
.orbit-labels.is-compact .term-inscribe {
  font-size: 10px;
  letter-spacing: 0.26em;
  padding-left: 0.26em;
  opacity: 0.78;
}
.orbit-labels.is-compact .term-inscribe.is-zhong,
.orbit-labels.is-compact .term-inscribe.is-major {
  font-size: 10.5px;
  letter-spacing: 0.28em;
  padding-left: 0.28em;
  opacity: 0.9;
}
.orbit-labels.is-compact .term-inscribe.is-active {
  font-size: 11.5px;
  letter-spacing: 0.32em;
  padding-left: 0.32em;
  opacity: 1;
}
.orbit-labels.is-compact .term-inscribe.is-mute:not(.is-revealed) {
  font-size: 0;
  letter-spacing: 0;
  padding: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(90, 138, 140, 0.55);
  border: 1px solid rgba(184, 150, 74, 0.38);
  box-shadow: 0 0 4px rgba(8, 14, 22, 0.45);
  opacity: 0.72;
  pointer-events: auto;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-stroke: 0;
  text-shadow: none;
}
.orbit-labels.is-compact .term-inscribe.is-mute.is-revealed {
  font-size: 10.5px;
  letter-spacing: 0.28em;
  padding-left: 0.28em;
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  opacity: 1;
  color: #ebdaa8;
  pointer-events: auto;
  -webkit-text-stroke: 0.35px rgba(20, 16, 8, 0.35);
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.45),
    0 0 8px rgba(184, 150, 74, 0.28);
}
.orbit-labels.is-compact .sky-inscribe.is-quiet {
  display: none;
}
/* 窄屏降密：参照星/辅助标签隐藏，仅保留「北天极」动态铭文 */
.orbit-labels.is-compact .sky-inscribe.is-ref,
.orbit-labels.is-compact .sky-inscribe.is-tag {
  display: none;
}

@media (max-width: 480px) {
  .orbit-labels .term-inscribe {
    font-size: 9px;
    letter-spacing: 0.26em;
  }
  .orbit-labels .term-inscribe.is-zhong {
    font-size: 10px;
  }
  .orbit-labels .sky-inscribe {
    font-size: 8.5px;
    letter-spacing: 0.22em;
  }
}

/* —— 屏幕方位罗盘 HUD —— */
.ground-hud {
  position: absolute;
  left: 50%;
  /* 抬高以免被 AppFooter 底栏遮挡方位/仰角读数 */
  bottom: calc(2.85rem + var(--safe-bottom, 0px));
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.hud-compass {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hud-svg {
  width: 5.6rem;
  height: 5.6rem;
  overflow: visible;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
}

.hud-bg {
  fill: rgba(8, 14, 22, 0.62);
  stroke: rgba(90, 138, 140, 0.42);
  stroke-width: 1.2;
}

.hud-tick {
  stroke: rgba(160, 208, 196, 0.4);
  stroke-width: 1;
}

.hud-tick.major {
  stroke: rgba(184, 150, 74, 0.62);
  stroke-width: 1.6;
}

.hud-cardinal {
  fill: rgba(233, 228, 214, 0.66);
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.02em;
  text-anchor: middle;
}

.hud-needle line {
  stroke: var(--dan-jin);
  stroke-width: 2.6;
  stroke-linecap: round;
  opacity: 0.95;
}

.hud-hub {
  fill: rgba(8, 14, 22, 0.9);
  stroke: var(--dan-jin);
  stroke-width: 1.4;
}

.hud-readout {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: rgba(233, 228, 214, 0.9);
  background: rgba(8, 14, 22, 0.66);
  border: 1px solid rgba(90, 138, 140, 0.3);
  border-radius: 4px;
  padding: 0.2rem 0.55rem;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .ground-hud {
    /* 抬过 AppFooter，并与左侧历象轨错开中心偏上 */
    bottom: calc(var(--app-footer-h, 2.4rem) + 0.75rem + var(--safe-bottom, 0px));
    left: 50%;
    transform: translateX(-50%);
  }
  .hud-svg {
    width: 4.4rem;
    height: 4.4rem;
  }
  .hud-readout {
    font-size: 0.54rem;
    padding: 0.16rem 0.45rem;
  }
}

@media (max-width: 720px) and (orientation: landscape) {
  .ground-hud {
    left: calc(0.7rem + var(--safe-left, 0px));
    right: auto;
    bottom: calc(var(--app-footer-h, 2.4rem) + 0.35rem + var(--safe-bottom, 0px));
    transform: none;
    align-items: flex-start;
  }
  .hud-svg {
    width: 3.8rem;
    height: 3.8rem;
  }
}
</style>
