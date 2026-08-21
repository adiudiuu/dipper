<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { DEG, JIEQI, SYNODIC, beijingNoonJD, civilOfMs } from '../lib/calendar.js'
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

const props = defineProps({
  sunLon: { type: Number, required: true },
  moonAge: { type: Number, required: true },
  currentMs: { type: Number, required: true },
  currentTerm: { type: String, default: '' },
  /** 星象层：west 西象 | east-core 古象纲 | east 古象繁 | all 全部 */
  constellationMode: { type: String, default: 'east' },
  /** 古象标签：繁/全部下可隐名控遮挡；纲模式始终显名 */
  eastLabels: { type: Boolean, default: true }
})

const emit = defineEmits(['scrub'])

const host = ref(null)
const canvas = ref(null)

const EARTH_ORBIT_R = 16
const MOON_ORBIT_R = 3.4
const PX_PER_DAY = 5
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
let scrubDrag = null
let lastT = 0
let ro
let skyWestGroup = null
let skyEastGroup = null
let skyEastExtraGroup = null
let eastLabelObjects = []

function applyConstellationMode() {
  const mode = props.constellationMode || 'east'
  const showWest = mode === 'west' || mode === 'all'
  const showEast = mode === 'east' || mode === 'east-core' || mode === 'all'
  const showExtra = mode === 'east' || mode === 'all'
  if (skyWestGroup) skyWestGroup.visible = showWest
  if (skyEastGroup) skyEastGroup.visible = showEast
  if (skyEastExtraGroup) skyEastExtraGroup.visible = showExtra
  applyEastLabels()
}

function applyEastLabels() {
  const mode = props.constellationMode || 'east'
  // 纲：骨架贴名；繁/全部：跟随显名开关（仅 core+名星有标签对象）
  const show = mode === 'east-core' || props.eastLabels !== false
  eastLabelObjects.forEach((lab) => {
    lab.visible = show
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

defineExpose({ resetCamera })

function makeFallbackTex(draw, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d'), size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
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
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
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
  el.className = `term-inscribe${jq.zhong ? ' is-zhong' : ' is-jie'}`
  el.textContent = jq.name
  el.setAttribute('aria-hidden', 'true')
  const obj = new CSS2DObject(el)
  obj.userData.termName = jq.name
  obj.userData.zhong = !!jq.zhong
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

function syncOrbits() {
  if (!earthOrbit || !moon) return
  const earthAng = (props.sunLon + 180) * DEG
  earthOrbit.position.set(
    Math.cos(earthAng) * EARTH_ORBIT_R,
    0,
    Math.sin(earthAng) * EARTH_ORBIT_R
  )
  const moonAng = (props.moonAge / SYNODIC) * Math.PI * 2
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
      node.position.set(Math.cos(ang) * p.orbit, 0, Math.sin(ang) * p.orbit)
    })
  }
  highlightTerm(props.currentTerm)
}

function highlightTerm(name) {
  if (!termLabelObjects.length || name === lastTermName) return
  lastTermName = name
  termLabelObjects.forEach((obj) => {
    const active = obj.userData.termName === name
    if (obj.userData.active === active) return
    setTermActive(obj, active)
  })
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
}

function animate(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000)
  lastT = now
  simTime += dt
  /* 自转：从北极（局部 +Y）俯视应为逆时针；Three.js 正 Y 转为顺时针，故取负 */
  if (earth) earth.rotation.y -= dt * 0.85
  if (moon) moon.rotation.y += dt * 0.32
  if (sun) sun.rotation.y += dt * 0.04
  sunGlowLayers.forEach((g, i) => {
    const pulse = 1 + 0.035 * Math.sin(now * 0.0018 + i)
    g.scale.setScalar(g.userData.baseScale * pulse)
  })
  if (planetGroup) {
    planetGroup.children.forEach((n) => {
      if (n.userData.spin) n.rotation.y += dt * n.userData.spin
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
  renderer.render(scene, camera)
  labelRenderer?.render(scene, camera)
  animId = requestAnimationFrame(animate)
}

/** Shift+左键拨日：捕获阶段关掉 OrbitControls，避免抢旋转 */
function onPointerDownCapture(e) {
  if (!host.value || !e.shiftKey || e.button !== 0) return
  if (controls) controls.enabled = false
  host.value.setPointerCapture(e.pointerId)
  scrubDrag = {
    x: e.clientX,
    lastX: e.clientX,
    lastT: performance.now(),
    vx: 0,
    days: 0
  }
  emit('scrub', { mode: 'start' })
}

function onPointerMove(e) {
  if (!scrubDrag) return
  const dx = e.clientX - scrubDrag.x
  const now = performance.now()
  const dt = Math.max(1, now - scrubDrag.lastT)
  scrubDrag.vx = ((e.clientX - scrubDrag.lastX) / dt) * 1000
  scrubDrag.lastX = e.clientX
  scrubDrag.lastT = now
  scrubDrag.days = dx / PX_PER_DAY
  emit('scrub', { mode: 'drag', days: scrubDrag.days })
}

function onPointerUp() {
  if (!scrubDrag) return
  emit('scrub', {
    mode: 'end',
    days: scrubDrag.days || 0,
    velocity: scrubDrag.vx / PX_PER_DAY
  })
  scrubDrag = null
  if (controls) controls.enabled = true
}

function onContextMenu(e) {
  e.preventDefault()
}

function buildConstellationLayer(parent, layer, tier) {
  CONSTELLATIONS.filter((c) => {
    if ((c.layer || 'west') !== layer) return false
    if (tier && (c.tier || 'major') !== tier) return false
    return true
  }).forEach((c) => {
    const quiet = c.tier === 'minor' || c.tier === 'extra'
    const dim = quiet && c.label === false
    const starOp = dim ? 0.55 : quiet ? 0.72 : 0.96
    const haloOp = dim ? 0.07 : quiet ? 0.12 : 0.22
    const lineOp = dim ? 0.26 : quiet ? 0.42 : 0.78
    const dirs = c.stars.map(([ra, dec, sz]) => ({
      dir: raDecToVec(ra, dec, 1).normalize(),
      sz: (sz || 1.2) * (dim ? 0.78 : quiet ? 0.88 : 1)
    }))
    // 向星座质心收拢张角，再投到天球；标签锚点跟收拢后的位置走
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
      parent.add(m)
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
    })
    // minor / label:false 不贴名；extra 名星淡铭；major/core 正常
    const showLabel = c.label !== false && c.tier !== 'minor'
    if (!showLabel) return
    const li = c.labelAt ?? 0
    const label = makeSkyInscribe(c.name)
    if (quiet) label.userData.el.classList.add('is-quiet')
    const anchor = pts[Math.min(li, pts.length - 1)].v.clone()
    label.position.copy(anchor).multiplyScalar(1.018)
    label.position.y += 0.45
    parent.add(label)
    if (layer === 'east') eastLabelObjects.push(label)
  })
}

async function buildPlanets(parent, texMap) {
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
        map: map || undefined,
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
          map: ringMap || undefined,
          color: ringMap ? 0xffffff : 0xc9b896,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          alphaMap: ringMap || undefined
        })
      )
      ring.rotation.x = Math.PI / 2.35
      body.add(ring)
    }
    const label = makeTextSprite(p.name, {
      color: p.dwarf ? '#C8B898' : '#D8D2C4',
      fontSize: p.dwarf ? 16 : 20,
      fontWeight: 500,
      scale: p.dwarf ? 1.15 : 1.4
    })
    label.position.set(0, p.size + (p.dwarf ? 0.7 : 0.85), 0)
    body.add(label)
    parent.add(body)
  }
}

onMounted(async () => {
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
  labelRenderer.setSize(host.value.clientWidth, host.value.clientHeight)
  labelRenderer.domElement.className = 'orbit-labels'
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelRenderer.domElement.style.zIndex = '0'
  host.value.appendChild(labelRenderer.domElement)

  // far 需覆盖天球星点与外行星；默认 FOV 配合距离收黄道可读全圈
  camera = new THREE.PerspectiveCamera(CAM_INIT_FOV, 1, 0.1, 1200)
  placeCamera()
  controls = setupControls(host.value)

  if (document.fonts?.ready) {
    try {
      await document.fonts.load('500 28px "Noto Serif SC"')
      await document.fonts.ready
    } catch {
      /* ignore */
    }
  }

  // 天球壳大于最远星点与相机拉远上限，BackSide 从内侧看
  scene.add(makeNebulaShell(230))
  nebulaSprites = makeNebulaSprites()
  nebulaSprites.renderOrder = -18
  scene.add(nebulaSprites)

  // 星点壳在相机最大半径之外，任意环视都仍在球内看满天星
  twinkleStars = [
    makeStarField(7200, 145, 230, 0xe8ecee, 1.2, 0.88),
    makeStarField(2600, 150, 235, 0xb0c8d4, 1.55, 0.72),
    makeStarField(1200, 155, 240, 0xe8d8b8, 2.1, 0.55),
    makeStarField(260, 148, 225, 0xf2f4f5, 3.5, 0.9, { crossed: true }),
    makeGalaxyBand(900, 175)
  ]
  twinkleStars.forEach((s) => scene.add(s))

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

  const skyRoot = new THREE.Group()
  scene.add(skyRoot)
  skyWestGroup = new THREE.Group()
  skyEastGroup = new THREE.Group()
  skyEastExtraGroup = new THREE.Group()
  skyRoot.add(skyWestGroup)
  skyRoot.add(skyEastGroup)
  skyEastGroup.add(skyEastExtraGroup)
  eastLabelObjects = []
  buildConstellationLayer(skyWestGroup, 'west')
  buildConstellationLayer(skyEastGroup, 'east', 'core')
  buildConstellationLayer(skyEastExtraGroup, 'east', 'extra')
  applyConstellationMode()

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
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(a) * r0, 0, Math.sin(a) * r0),
      new THREE.Vector3(Math.cos(a) * r1, 0, Math.sin(a) * r1)
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
    label.position.set(Math.cos(a) * lr, 0.08, Math.sin(a) * lr)
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
    map: earthTex,
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
      map: moonTex,
      roughness: 0.92,
      metalness: 0.02,
      emissive: new THREE.Color(0x222018),
      emissiveIntensity: 0.08
    })
  )
  moonOrbit.add(moon)

  const earthLabel = makeTextSprite('地球', {
    color: '#D0DCE0',
    fontSize: 22,
    fontWeight: 500,
    scale: 1.4
  })
  earthLabel.position.set(0, 2.0, 0)
  earthOrbit.add(earthLabel)

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

  syncOrbits()
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(host.value)
  lastT = performance.now()
  animId = requestAnimationFrame(animate)

  /* 拨日用捕获；旋转/缩放/平移由 OrbitControls 接管（仅挂在 3D host） */
  host.value.addEventListener('pointerdown', onPointerDownCapture, true)
  host.value.addEventListener('pointermove', onPointerMove)
  host.value.addEventListener('pointerup', onPointerUp)
  host.value.addEventListener('pointercancel', onPointerUp)
  host.value.addEventListener('contextmenu', onContextMenu)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  ro?.disconnect()
  if (host.value) {
    host.value.removeEventListener('pointerdown', onPointerDownCapture, true)
    host.value.removeEventListener('pointermove', onPointerMove)
    host.value.removeEventListener('pointerup', onPointerUp)
    host.value.removeEventListener('pointercancel', onPointerUp)
    host.value.removeEventListener('contextmenu', onContextMenu)
    if (labelRenderer?.domElement?.parentNode === host.value) {
      host.value.removeChild(labelRenderer.domElement)
    }
  }
  controls?.dispose()
  controls = null
  termLabelObjects = []
  labelRenderer = null
  renderer?.dispose()
})

watch(() => [props.sunLon, props.moonAge, props.currentMs, props.currentTerm], syncOrbits)
watch(() => props.constellationMode, applyConstellationMode)
watch(() => props.eastLabels, applyEastLabels)
</script>

<template>
  <div ref="host" class="orbit-host">
    <canvas ref="canvas" class="orbit-canvas" />
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
</style>
