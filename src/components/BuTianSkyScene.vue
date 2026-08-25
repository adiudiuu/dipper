<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import WebGL from 'three/examples/jsm/capabilities/WebGL.js'
import {
  CONSTELLATIONS,
  makeGalaxyBand,
  makeNebulaShell,
  makeNebulaSprites,
  makeStarField,
  raDecToVec
} from '../lib/sky.js'

const props = defineProps({
  /** 当前高亮的星官名列表 */
  highlightNames: { type: Array, default: () => [] },
  /** 是否显示全部古象纲标签 */
  showLabels: { type: Boolean, default: true }
})

const emit = defineEmits(['constellation-click'])

const host = ref(null)
const canvas = ref(null)

const SKY_R = 70
const CONSTELLATION_SPAN = 0.82
const CAM_INIT_RADIUS = 58
const CAM_INIT_THETA = 0.72
const CAM_INIT_PHI = 1.05
const CAM_INIT_FOV = 48

/** @type {Map<string, { stars: THREE.Mesh[], halos: THREE.Mesh[], lines: THREE.Line[], label: import('three/examples/jsm/renderers/CSS2DRenderer.js').CSS2DObject | null, center: THREE.Vector3 }>} */
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

function buildEastCore(parent) {
  CONSTELLATIONS.filter((c) => c.layer === 'east' && c.tier === 'core').forEach((c) => {
    const starOp = 0.92
    const haloOp = 0.2
    const lineOp = 0.76
    const dirs = c.stars.map(([ra, dec, sz]) => ({
      dir: raDecToVec(ra, dec, 1).normalize(),
      sz: sz || 1.2
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
      center: pts[0].v.clone()
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
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.32 * p.sz, 12, 12), mat)
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
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.55 * p.sz, 10, 10), haloMat)
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
    const li = c.labelAt ?? 0
    const label = makeSkyInscribe(c.name)
    const anchor = pts[Math.min(li, pts.length - 1)].v.clone()
    label.position.copy(anchor).multiplyScalar(1.018)
    label.position.y += 0.45
    label.userData.constellationName = c.name
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

function applyHighlight() {
  const names = props.highlightNames || []
  const hasFocus = names.length > 0
  const focusSet = new Set(names)

  constellationMap.forEach((entry, name) => {
    const active = focusSet.has(name)
    const dimmed = hasFocus && !active
    const starOp = active ? 1 : dimmed ? 0.22 : 0.55
    const haloOp = active ? 0.42 : dimmed ? 0.04 : 0.12
    const lineOp = active ? 0.95 : dimmed ? 0.12 : 0.38
    entry.stars.forEach((m) => {
      applyMaterialOpacity(m, starOp)
      if (active) m.scale.setScalar(1.35)
      else m.scale.setScalar(1)
    })
    entry.halos.forEach((m) => applyMaterialOpacity(m, haloOp))
    entry.lines.forEach((l) => applyMaterialOpacity(l, lineOp))
    setLabelHighlight(entry.label, active, dimmed)
  })

  if (hasFocus) {
    desiredFocus.set(0, 0, 0)
    let count = 0
    names.forEach((n) => {
      const e = constellationMap.get(n)
      if (e) {
        desiredFocus.add(e.center)
        count += 1
      }
    })
    if (count > 0) desiredFocus.divideScalar(count)
  } else {
    desiredFocus.set(0, 0, 0)
  }
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

  const skyGroup = new THREE.Group()
  scene.add(skyGroup)
  buildEastCore(skyGroup)
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
  constellationMap.clear()
})

watch(() => props.highlightNames, applyHighlight, { deep: true })
watch(() => props.showLabels, (show) => {
  constellationMap.forEach((entry) => {
    if (entry.label) entry.label.visible = show
  })
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
</style>
