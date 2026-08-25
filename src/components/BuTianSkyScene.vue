<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import WebGL from 'three/examples/jsm/capabilities/WebGL.js'
import { getBuTianGeAsterismNames } from '../lib/buTianGe.js'
import {
  CONSTELLATIONS,
  ensureExtraAsterisms,
  makeGalaxyBand,
  makeNebulaShell,
  makeNebulaSprites,
  makeStarField,
  raDecToVec
} from '../lib/sky.js'

const props = defineProps({
  /** 当前高亮的星官/星座名列表 */
  highlightNames: { type: Array, default: () => [] },
  /** 是否显示星名（西象/古象当前层均生效） */
  showLabels: { type: Boolean, default: true },
  /** 星象层：west 西象 | east 古象（全量）| all 两层同显 */
  constellationMode: { type: String, default: 'east' }
})

/** 歌诀引用到的东象名：用于优先贴名（全量仍挂载） */
const LYRIC_ASTERISM_NAMES = getBuTianGeAsterismNames()

const emit = defineEmits(['constellation-click'])

const host = ref(null)
const canvas = ref(null)

const SKY_R = 70
const CONSTELLATION_SPAN = 0.82
const CAM_INIT_RADIUS = 58
const CAM_INIT_THETA = 0.72
const CAM_INIT_PHI = 1.05
const CAM_INIT_FOV = 48

/** @type {Map<string, { stars: THREE.Mesh[], halos: THREE.Mesh[], lines: THREE.Line[], label: import('three/examples/jsm/renderers/CSS2DRenderer.js').CSS2DObject | null, center: THREE.Vector3, layer: string, isPrimary: boolean }>} */
const constellationMap = new Map()

let renderer
let labelRenderer
let scene
let camera
let controls
let animId = 0
let lastT = 0
let ro
let mountedAlive = false
let focusTarget = new THREE.Vector3(0, 0, 0)
let desiredFocus = new THREE.Vector3(0, 0, 0)
let eastGroup = null
let westGroup = null

function makeSkyInscribe(name) {
  const el = document.createElement('div')
  el.className = 'sky-inscribe'
  el.textContent = name
  el.setAttribute('aria-hidden', 'true')
  const obj = new CSS2DObject(el)
  obj.userData.el = el
  return obj
}

function setLabelHighlight(label, active, dimmed) {
  if (!label?.userData?.el) return
  const el = label.userData.el
  el.classList.toggle('is-active', active)
  el.classList.toggle('is-dim', dimmed && !active)
}

function applyMaterialOpacity(mesh, opacity) {
  if (!mesh?.material) return
  mesh.material.opacity = opacity
  mesh.material.transparent = true
}

function shouldInclude(c, layer) {
  return c.layer === layer
}

function isPrimaryAsterism(c, layer) {
  if (layer === 'east') {
    // core 与歌诀引用的附座优先贴名；其余 extra 默认较淡
    if (c.tier === 'core') return true
    return LYRIC_ASTERISM_NAMES.has(c.name)
  }
  return c.tier === 'major'
}

function buildAsterisms(parent, layer) {
  CONSTELLATIONS.filter((c) => shouldInclude(c, layer) && !constellationMap.has(c.name)).forEach((c) => {
    const isPrimary = isPrimaryAsterism(c, layer)
    const starOp = isPrimary ? 0.92 : 0.42
    const haloOp = isPrimary ? 0.2 : 0.08
    const lineOp = isPrimary ? 0.76 : 0.28
    const dirs = c.stars.map(([ra, dec, sz]) => ({
      dir: raDecToVec(ra, dec, 1).normalize(),
      sz: sz || (isPrimary ? 1.2 : 0.95)
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
      center: pts[0].v.clone(),
      layer,
      isPrimary
    }
    if (pts.length > 1) {
      entry.center = new THREE.Vector3()
      pts.forEach((p) => entry.center.add(p.v))
      entry.center.divideScalar(pts.length)
    }
    pts.forEach((p) => {
      const mat = new THREE.MeshBasicMaterial({
        color: c.color,
        transparent: true,
        opacity: starOp,
        fog: false,
        depthWrite: false
      })
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.32 * p.sz * (isPrimary ? 1 : 0.88), 12, 12),
        mat
      )
      m.position.copy(p.v)
      m.renderOrder = -3
      m.userData.constellationName = c.name
      parent.add(m)
      entry.stars.push(m)
      const haloMat = new THREE.MeshBasicMaterial({
        color: c.color,
        transparent: true,
        opacity: haloOp,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending
      })
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.55 * p.sz * (isPrimary ? 1 : 0.88), 10, 10),
        haloMat
      )
      halo.position.copy(p.v)
      halo.renderOrder = -3
      parent.add(halo)
      entry.halos.push(halo)
    })
    c.lines.forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([pts[a].v, pts[b].v])
      const lineMat = new THREE.LineBasicMaterial({
        color: c.color,
        transparent: true,
        opacity: lineOp,
        fog: false,
        depthWrite: false
      })
      const line = new THREE.Line(geo, lineMat)
      line.renderOrder = -3
      parent.add(line)
      entry.lines.push(line)
    })
    // 西象 minor / label:false 默认不贴名；高亮时仍可显名
    const allowDefaultLabel = c.label !== false && c.tier !== 'minor'
    const li = c.labelAt ?? 0
    const label = makeSkyInscribe(c.name)
    const anchor = pts[Math.min(li, pts.length - 1)].v.clone()
    label.position.copy(anchor).multiplyScalar(1.018)
    label.position.y += 0.45
    label.userData.constellationName = c.name
    label.visible = allowDefaultLabel && isPrimary && props.showLabels
    if (c.culture) {
      const el = label.userData.el
      el.classList.add('is-clickable')
      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      el.setAttribute('aria-label', `${c.name} 星官故事`)
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        emit('constellation-click', { name: c.name, culture: c.culture })
      })
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault()
          emit('constellation-click', { name: c.name, culture: c.culture })
        }
      })
    }
    parent.add(label)
    entry.label = label
    constellationMap.set(c.name, entry)
  })
}

function layerVisible(entryLayer, mode) {
  if (mode === 'all') return true
  return entryLayer === mode
}

function applyLayerVisibility() {
  const mode = props.constellationMode || 'east'
  if (eastGroup) eastGroup.visible = mode === 'east' || mode === 'all'
  if (westGroup) westGroup.visible = mode === 'west' || mode === 'all'
}

function applyHighlight() {
  const mode = props.constellationMode || 'east'
  const names = props.highlightNames || []
  const hasFocus = names.length > 0
  const focusSet = new Set(names)

  constellationMap.forEach((entry, name) => {
    if (!layerVisible(entry.layer, mode)) return
    const active = focusSet.has(name)
    const dimmed = hasFocus && !active
    const isPrimary = entry.isPrimary
    const starOp = active
      ? 1
      : dimmed
        ? isPrimary
          ? 0.18
          : 0.06
        : isPrimary
          ? 0.55
          : 0.22
    const haloOp = active ? 0.42 : dimmed ? 0.03 : isPrimary ? 0.12 : 0.05
    const lineOp = active ? 0.95 : dimmed ? (isPrimary ? 0.1 : 0.04) : isPrimary ? 0.38 : 0.16
    entry.stars.forEach((m) => {
      applyMaterialOpacity(m, starOp)
      if (active) m.scale.setScalar(1.35)
      else m.scale.setScalar(1)
    })
    entry.halos.forEach((m) => applyMaterialOpacity(m, haloOp))
    entry.lines.forEach((l) => applyMaterialOpacity(l, lineOp))
    if (entry.label) {
      entry.label.visible = props.showLabels && (isPrimary || active)
      setLabelHighlight(entry.label, active, dimmed && isPrimary)
    }
  })

  if (hasFocus) {
    desiredFocus.set(0, 0, 0)
    let count = 0
    names.forEach((n) => {
      const e = constellationMap.get(n)
      if (e && layerVisible(e.layer, mode)) {
        desiredFocus.add(e.center)
        count += 1
      }
    })
    if (count > 0) desiredFocus.divideScalar(count)
  } else {
    desiredFocus.set(0, 0, 0)
  }
}

async function ensureEastLayerReady() {
  const mode = props.constellationMode || 'east'
  if (mode !== 'east' && mode !== 'all') return
  await ensureExtraAsterisms()
  if (!mountedAlive || !eastGroup) return
  buildAsterisms(eastGroup, 'east')
}

function placeCamera() {
  const sp = Math.sin(CAM_INIT_PHI)
  camera.position.set(
    CAM_INIT_RADIUS * sp * Math.cos(CAM_INIT_THETA),
    CAM_INIT_RADIUS * Math.cos(CAM_INIT_PHI),
    CAM_INIT_RADIUS * sp * Math.sin(CAM_INIT_THETA)
  )
  camera.lookAt(0, 0, 0)
}

function resize() {
  if (!host.value || !renderer || !camera) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  camera.aspect = w / Math.max(h, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
  labelRenderer?.setSize(w, h)
}

function animate(now) {
  if (!mountedAlive || !renderer) return
  const dt = Math.min(0.05, (now - lastT) / 1000)
  lastT = now
  focusTarget.lerp(desiredFocus, Math.min(1, dt * 2.2))
  if (controls) {
    controls.target.lerp(focusTarget, Math.min(1, dt * 2.2))
    controls.update()
  }
  renderer.render(scene, camera)
  labelRenderer?.render(scene, camera)
  animId = requestAnimationFrame(animate)
}

onMounted(async () => {
  mountedAlive = true

  if (!WebGL.isWebGLAvailable()) {
    const msg = WebGL.getWebGLErrorMessage()
    host.value?.appendChild(msg)
    return
  }

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0a121a, 0.0015)
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
  renderer.toneMappingExposure = 1.28

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(host.value.clientWidth, host.value.clientHeight)
  labelRenderer.domElement.className = 'butian-labels'
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelRenderer.domElement.style.zIndex = '1'
  host.value.appendChild(labelRenderer.domElement)

  camera = new THREE.PerspectiveCamera(CAM_INIT_FOV, 1, 0.1, 800)
  placeCamera()
  controls = new OrbitControls(camera, host.value)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 18
  controls.maxDistance = 140
  controls.enablePan = false
  controls.target.set(0, 0, 0)

  if (document.fonts?.ready) {
    try {
      await document.fonts.load('500 28px "Noto Serif SC"')
      await document.fonts.ready
    } catch {
      /* ignore */
    }
  }
  if (!mountedAlive) return

  scene.add(makeNebulaShell(220))
  const nebulaSprites = makeNebulaSprites()
  nebulaSprites.renderOrder = -18
  scene.add(nebulaSprites)

  ;[
    makeStarField(5200, 145, 220, 0xe8ecee, 1.2, 0.88),
    makeStarField(1800, 150, 225, 0xb0c8d4, 1.55, 0.72),
    makeStarField(800, 155, 230, 0xe8d8b8, 2.1, 0.55),
    makeGalaxyBand(700, 175)
  ].forEach((s) => scene.add(s))

  eastGroup = new THREE.Group()
  westGroup = new THREE.Group()
  scene.add(eastGroup)
  scene.add(westGroup)
  buildAsterisms(westGroup, 'west')
  buildAsterisms(eastGroup, 'east')
  await ensureEastLayerReady()
  if (!mountedAlive) return
  applyLayerVisibility()
  applyHighlight()

  ro = new ResizeObserver(resize)
  ro.observe(host.value)
  resize()
  lastT = performance.now()
  animId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  mountedAlive = false
  cancelAnimationFrame(animId)
  ro?.disconnect()
  controls?.dispose()
  if (host.value && labelRenderer?.domElement?.parentNode === host.value) {
    host.value.removeChild(labelRenderer.domElement)
  }
  labelRenderer = null
  // 递归释放场景中所有 GPU 资源
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh || child.isPoints || child.isLine) {
        child.geometry?.dispose()
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((mat) => {
            if (mat.map) mat.map.dispose()
            if (mat.alphaMap) mat.alphaMap.dispose()
            mat.dispose()
          })
        }
      }
    })
  }
  renderer?.dispose()
  renderer = null
  constellationMap.clear()
  eastGroup = null
  westGroup = null
})

watch(() => props.highlightNames, applyHighlight, { deep: true })
watch(() => props.showLabels, () => {
  applyHighlight()
})
watch(() => props.constellationMode, async () => {
  await ensureEastLayerReady()
  applyLayerVisibility()
  applyHighlight()
})
</script>

<template>
  <div ref="host" class="butian-sky">
    <canvas ref="canvas" class="butian-canvas" aria-hidden="true" />
  </div>
</template>

<style scoped>
.butian-sky {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 12rem;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.butian-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

<style>
.butian-labels .sky-inscribe {
  font-family: 'Noto Serif SC', 'Songti SC', 'Noto Sans SC', serif;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.36em;
  color: rgba(196, 188, 168, 0.72);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  line-height: 1;
  padding: 0 0 0 0.36em;
  transition: color 0.22s, text-shadow 0.22s;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke: 0.4px rgba(8, 14, 22, 0.52);
  paint-order: stroke fill;
  text-shadow: 0 1px 2px rgba(6, 10, 16, 0.5);
}

.butian-labels .sky-inscribe.is-dim {
  color: rgba(140, 136, 124, 0.35);
  -webkit-text-stroke: 0.3px rgba(8, 14, 22, 0.35);
}

.butian-labels .sky-inscribe.is-active {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4em;
  color: #ebdaa8;
  -webkit-text-stroke: 0.35px rgba(20, 16, 8, 0.35);
  text-shadow:
    0 1px 2px rgba(6, 10, 16, 0.45),
    0 0 12px rgba(184, 150, 74, 0.42);
}

.butian-labels .sky-inscribe.is-clickable {
  pointer-events: auto;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.butian-labels .sky-inscribe.is-clickable:hover,
.butian-labels .sky-inscribe.is-clickable:focus-visible {
  color: rgba(235, 218, 168, 0.98);
  outline: none;
}

@media (max-width: 720px) {
  .butian-labels .sky-inscribe {
    font-size: 9.5px;
    letter-spacing: 0.26em;
    padding-left: 0.26em;
  }
  .butian-labels .sky-inscribe.is-active {
    font-size: 11px;
    letter-spacing: 0.3em;
  }
  .butian-labels .sky-inscribe.is-dim {
    display: none;
  }
}

@media (max-width: 480px) {
  .butian-labels .sky-inscribe {
    font-size: 8.5px;
    letter-spacing: 0.2em;
  }
}
</style>
