<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OrbitScene from '../components/OrbitScene.vue'
import AppHeader from '../components/AppHeader.vue'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import AlmanacPanel from '../components/AlmanacPanel.vue'
import CultureCard from '../components/CultureCard.vue'
import { isEditableTarget } from '../composables/useContentGuard.js'
import {
  DAY_MS,
  beijingDayStartMs,
  civilOfMs,
  daoYearFromXiYuan,
  formatLunar,
  formatSolar,
  getJieqiContext,
  moonAgeDays,
  moonPhaseFraction,
  msToJD,
  phaseName
} from '../lib/calendar.js'
import { getFestivalsOn } from '../lib/festivals.js'
import { formatSuiXing } from '../lib/sky.js'

const DESKTOP_MQ = '(min-width: 721px)'
const MOBILE_HINT_KEY = 'dipper.mobileHintDismissed'

/** 星空/播放用高精度时刻；历象侧栏用 panelMs（播放中节流） */
const currentMs = ref(Date.now())
const panelMs = ref(currentMs.value)
const scrubOriginMs = ref(null)
const lixiangOpen = ref(typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches)
const isMobileLayout = ref(typeof window !== 'undefined' && !window.matchMedia(DESKTOP_MQ).matches)
const showMobileHint = ref(false)
const constellationMode = ref('east')
const eastLabels = ref(true)
const viewMode = ref('orbit')

/** 观测位置预设 */
const LOCATIONS = [
  { name: '北京', lat: 39.9, lon: 116.4 },
  { name: '上海', lat: 31.2, lon: 121.5 },
  { name: '广州', lat: 23.1, lon: 113.3 },
  { name: '成都', lat: 30.6, lon: 104.1 },
  { name: '西安', lat: 34.3, lon: 108.9 },
  { name: '拉萨', lat: 29.7, lon: 91.1 },
  { name: '郑州', lat: 34.8, lon: 113.7 },
  { name: '苏州', lat: 31.3, lon: 120.6 }
]
const observerLat = ref(39.9)
const observerLon = ref(116.4)
const observerPlace = ref('北京')

/** 时间加速：天/秒；默认 1小时/秒，最高 30天/秒 */
const TIME_SPEEDS = [
  { label: '1小时/秒', daysPerSec: 1 / 24 },
  { label: '1天/秒', daysPerSec: 1 },
  { label: '7天/秒', daysPerSec: 7 },
  { label: '30天/秒', daysPerSec: 30 }
]
const DEFAULT_SPEED_IDX = 0
const PANEL_THROTTLE_MS = 160
const timePlaying = ref(false)
const timeSpeedIdx = ref(DEFAULT_SPEED_IDX)
const timeSpeedLabel = computed(() => TIME_SPEEDS[timeSpeedIdx.value].label)
let playRaf = 0
let playLastT = 0
let lastPanelFlush = 0

function flushPanelMs(ms = currentMs.value) {
  panelMs.value = ms
  lastPanelFlush = performance.now()
}

function pauseTimePlay() {
  timePlaying.value = false
  cancelAnimationFrame(playRaf)
  playRaf = 0
  flushPanelMs()
}

function toggleTimePlay() {
  if (timePlaying.value) {
    pauseTimePlay()
    return
  }
  timePlaying.value = true
  playLastT = performance.now()
  playRaf = requestAnimationFrame(playTick)
}

function cycleTimeSpeed() {
  timeSpeedIdx.value = (timeSpeedIdx.value + 1) % TIME_SPEEDS.length
}

watch(viewMode, (mode) => {
  if (mode !== 'ground') pauseTimePlay()
})

function playTick(t) {
  if (!timePlaying.value) return
  const dt = Math.min(0.05, Math.max(0.001, (t - playLastT) / 1000))
  playLastT = t
  const days = dt * TIME_SPEEDS[timeSpeedIdx.value].daysPerSec
  const next = currentMs.value + days * DAY_MS
  // 播放到历法可算范围边界自动停止
  const ny = civilOfMs(next).y
  if (ny < MIN_YEAR || ny > MAX_YEAR) {
    pauseTimePlay()
    setDate(next, false)
    return
  }
  setDate(next, false)
  playRaf = requestAnimationFrame(playTick)
}

const SKY_MODES = [
  { id: 'west', label: '西象' },
  { id: 'east', label: '古象' },
  { id: 'all', label: '全部' }
]

const orbitSceneRef = ref(null)
const almanacRef = ref(null)
const cultureOpen = ref(false)
const cultureName = ref('')
const cultureData = ref(null)

function onCultureOpen(payload) {
  cultureName.value = payload.name
  cultureData.value = payload.culture
  cultureOpen.value = true
}

function closeCulture() {
  cultureOpen.value = false
}

function snapToNoon(ms) {
  const ymd = civilOfMs(ms)
  return beijingDayStartMs(ymd.y, ymd.m, ymd.d) + 12 * 3600 * 1000
}

/** 历法示意可靠区间（与播放边界一致） */
const MIN_YEAR = 1900
const MAX_YEAR = 2100

function clampMsToCalendarRange(ms) {
  const y = civilOfMs(ms).y
  if (y < MIN_YEAR) return beijingDayStartMs(MIN_YEAR, 1, 1) + 12 * 3600 * 1000
  if (y > MAX_YEAR) return beijingDayStartMs(MAX_YEAR, 12, 31) + 12 * 3600 * 1000
  return ms
}

function setDate(ms, snap = true) {
  const next = snap ? snapToNoon(ms) : ms
  const clamped = clampMsToCalendarRange(next)
  currentMs.value = clamped
  // 播放中节流侧栏/历算，避免每帧 formatLunar / 节气求解拖垮帧率；星空仍跟 currentMs
  if (!timePlaying.value || snap) {
    flushPanelMs(clamped)
    return
  }
  if (performance.now() - lastPanelFlush >= PANEL_THROTTLE_MS) {
    flushPanelMs(clamped)
  }
}

/** 历象侧栏与轨道日月读数：跟 panelMs（播放中约 160ms 一刷） */
const ymd = computed(() => civilOfMs(panelMs.value))
const jd = computed(() => msToJD(panelMs.value))
const solarText = computed(() => formatSolar(ymd.value.y, ymd.value.m, ymd.value.d))

const lunar = computed(() => {
  try {
    const hourBj = ymd.value.h ?? 12
    const minuteBj = ymd.value.min ?? 0
    return formatLunar(ymd.value.y, ymd.value.m, ymd.value.d, hourBj, minuteBj)
  } catch {
    return {
      text: '历法计算异常',
      mdText: '',
      isLeapMonth: false,
      ganzhi: { sx: '—', gan: '', zhi: '', pillars: null }
    }
  }
})

const lunarMainText = computed(() => {
  const gz = lunar.value.ganzhi
  const md = lunar.value.mdText
  if (!gz?.gan || !gz?.zhi) return lunar.value.text || '历法计算异常'
  const sx = gz.sx || '—'
  return md ? `${gz.gan}${gz.zhi} ${sx}年 ${md}` : `${gz.gan}${gz.zhi} ${sx}年`
})

const sizhu = computed(() => lunar.value.ganzhi?.pillars || null)

const daoYearText = computed(() => `道历 ${daoYearFromXiYuan(ymd.value.y)}`)
const jieqi = computed(() => getJieqiContext(jd.value))
const sunLon = computed(() => jieqi.value.longitude)
const moonAge = computed(() => moonAgeDays(jd.value))
const phaseFrac = computed(() => moonPhaseFraction(jd.value))
const phaseLabel = computed(() => phaseName(phaseFrac.value, moonAge.value))
const termIntoDays = computed(() => Math.max(0, Math.floor(jieqi.value.daysInto)))
const termSub = computed(() => {
  const left = Math.max(0, Math.ceil(jieqi.value.daysLeft - 1e-6))
  return `距${jieqi.value.next.name}还有 ${left} 天`
})

const suiXing = computed(() => {
  try {
    return formatSuiXing(jd.value, sunLon.value)
  } catch {
    return { text: '', ci: '', lon: null }
  }
})

const todayFestivals = computed(() => {
  try {
    return getFestivalsOn(ymd.value.y, ymd.value.m, ymd.value.d)
  } catch {
    return []
  }
})

const dateInputValue = computed({
  get() {
    const { y, m, d } = ymd.value
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  },
  set(v) {
    if (!v) return
    const [y, m, d] = v.split('-').map(Number)
    setDate(beijingDayStartMs(y, m, d) + 12 * 3600 * 1000)
  }
})

function onPanelWheel(e) {
  e.stopPropagation()
}

function goDefaults() {
  pauseTimePlay()
  cancelAnimationFrame(inertiaId)
  scrubOriginMs.value = null
  constellationMode.value = 'east'
  eastLabels.value = true
  viewMode.value = 'orbit'
  observerLat.value = LOCATIONS[0].lat
  observerLon.value = LOCATIONS[0].lon
  observerPlace.value = LOCATIONS[0].name
  timeSpeedIdx.value = DEFAULT_SPEED_IDX
  lixiangOpen.value = defaultLixiangOpen()
  setDate(Date.now())
  nextTick(() => {
    orbitSceneRef.value?.resetCamera?.()
    almanacRef.value?.resetFestivals?.()
  })
}

function addDays(n) {
  setDate(currentMs.value + n * DAY_MS)
}

function jumpTo(item) {
  setDate(beijingDayStartMs(item.y, item.m, item.d) + 12 * 3600 * 1000)
}

function toggleLixiang() {
  lixiangOpen.value = !lixiangOpen.value
}

function defaultLixiangOpen() {
  return window.matchMedia(DESKTOP_MQ).matches
}

function syncLayoutBreakpoint() {
  const desktop = window.matchMedia(DESKTOP_MQ).matches
  isMobileLayout.value = !desktop
}

function dismissMobileHint() {
  showMobileHint.value = false
  try {
    localStorage.setItem(MOBILE_HINT_KEY, '1')
  } catch {
    /* ignore */
  }
}

let inertiaId = 0

function onScrub(payload) {
  if (payload.mode === 'start') {
    pauseTimePlay()
    scrubOriginMs.value = currentMs.value
    cancelAnimationFrame(inertiaId)
    return
  }
  if (payload.mode === 'drag') {
    if (scrubOriginMs.value == null) scrubOriginMs.value = currentMs.value
    setDate(scrubOriginMs.value + payload.days * DAY_MS, false)
    return
  }
  if (payload.mode === 'end') {
    const origin = scrubOriginMs.value ?? currentMs.value
    scrubOriginMs.value = null
    cancelAnimationFrame(inertiaId)
    const vx = payload.velocity || 0
    if (Math.abs(vx) > 8) {
      const startMs = currentMs.value
      const start = performance.now()
      const glide = (t) => {
        const elapsed = (t - start) / 1000
        const moved = (vx * (1 - Math.exp(-elapsed * 2.5))) / 2.5
        setDate(startMs + moved * DAY_MS, false)
        if (Math.abs(vx) * Math.exp(-elapsed * 2.5) > 8 && elapsed < 2.2) {
          inertiaId = requestAnimationFrame(glide)
        } else {
          setDate(currentMs.value, true)
        }
      }
      inertiaId = requestAnimationFrame(glide)
    } else {
      setDate(origin + payload.days * DAY_MS, true)
    }
  }
}

function onKeydown(e) {
  if (isEditableTarget(e.target)) return
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    addDays(e.shiftKey ? -30 : -1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    addDays(e.shiftKey ? 30 : 1)
  }
}

let desktopMq
let onBreakpointChange

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  setDate(Date.now())

  desktopMq = window.matchMedia(DESKTOP_MQ)
  isMobileLayout.value = !desktopMq.matches
  onBreakpointChange = () => syncLayoutBreakpoint()
  desktopMq.addEventListener('change', onBreakpointChange)
  window.addEventListener('orientationchange', onBreakpointChange)

  if (
    isMobileLayout.value &&
    typeof matchMedia === 'function' &&
    matchMedia('(pointer: coarse)').matches
  ) {
    try {
      if (!localStorage.getItem(MOBILE_HINT_KEY)) showMobileHint.value = true
    } catch {
      showMobileHint.value = true
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  cancelAnimationFrame(inertiaId)
  cancelAnimationFrame(playRaf)
  desktopMq?.removeEventListener('change', onBreakpointChange)
  window.removeEventListener('orientationchange', onBreakpointChange)
})
</script>

<template>
  <div class="home">
    <SpaceBackdrop />
    <AppHeader
      v-model:constellation-mode="constellationMode"
      v-model:east-labels="eastLabels"
      v-model:view-mode="viewMode"
      v-model:date-value="dateInputValue"
      :sky-modes="SKY_MODES"
      :locations="LOCATIONS"
      :observer-lat="observerLat"
      :observer-lon="observerLon"
      :observer-place="observerPlace"
      :time-playing="timePlaying"
      :time-speed-label="timeSpeedLabel"
      @update:observer-lat="observerLat = $event"
      @update:observer-lon="observerLon = $event"
      @update:observer-place="observerPlace = $event"
      @toggle-play="toggleTimePlay"
      @cycle-speed="cycleTimeSpeed"
      @defaults="goDefaults"
      @add-days="addDays"
    />
    <button
      v-if="lixiangOpen && isMobileLayout"
      type="button"
      class="panel-overlay"
      aria-label="关闭历象"
      @click="toggleLixiang"
    />
    <div v-if="showMobileHint" class="mobile-hint" role="status">
      <p>长按画面后横拖可拨日；顶栏 ‹ › 可换日</p>
      <button type="button" class="mobile-hint-dismiss" @click="dismissMobileHint">知道了</button>
    </div>
    <main class="stage">
      <OrbitScene
        ref="orbitSceneRef"
        :sun-lon="sunLon"
        :moon-age="moonAge"
        :current-ms="currentMs"
        :current-term="jieqi.current.name"
        :constellation-mode="constellationMode"
        :east-labels="eastLabels"
        :view-mode="viewMode"
        :observer-lat="observerLat"
        :observer-lon="observerLon"
        @scrub="onScrub"
        @culture-open="onCultureOpen"
      />
      <AlmanacPanel
        ref="almanacRef"
        :open="lixiangOpen"
        :solar-text="solarText"
        :lunar-main-text="lunarMainText"
        :is-leap-month="lunar.isLeapMonth"
        :dao-year-text="daoYearText"
        :sui-xing="suiXing"
        :sizhu="sizhu"
        :current-term="jieqi.current.name"
        :term-into-days="termIntoDays"
        :term-sub="termSub"
        :phase-frac="phaseFrac"
        :phase-label="phaseLabel"
        :moon-age="moonAge"
        :today-festivals="todayFestivals"
        :y="ymd.y"
        :m="ymd.m"
        :d="ymd.d"
        @toggle="toggleLixiang"
        @jump="jumpTo"
        @panel-wheel="onPanelWheel"
      />
      <CultureCard
        :open="cultureOpen"
        :name="cultureName"
        :culture="cultureData"
        @close="closeCulture"
      />
    </main>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  isolation: isolate;
}

.stage {
  position: relative;
  height: 100%;
  min-height: 0;
}

.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  margin: 0;
  padding: 0;
  border: none;
  background: rgba(4, 8, 14, 0.42);
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}

.mobile-hint {
  position: fixed;
  left: 50%;
  bottom: calc(var(--app-footer-h) + 3.2rem + var(--safe-bottom));
  z-index: 25;
  transform: translateX(-50%);
  width: min(18rem, calc(100vw - 1.5rem - var(--safe-left) - var(--safe-right)));
  padding: 0.65rem 0.75rem 0.55rem;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(8, 14, 22, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  text-align: center;
  pointer-events: auto;
}

.mobile-hint p {
  font-size: 0.72rem;
  line-height: 1.55;
  letter-spacing: 0.06em;
  color: rgba(233, 228, 214, 0.88);
}

.mobile-hint-dismiss {
  appearance: none;
  margin-top: 0.55rem;
  border: 1px solid rgba(184, 150, 74, 0.45);
  background: rgba(184, 150, 74, 0.1);
  color: var(--dan-jin);
  font-family: var(--font-sans);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  padding: 0.38rem 0.85rem;
  min-height: var(--tap-min);
  cursor: pointer;
}

@media (max-width: 720px) and (orientation: landscape) {
  .mobile-hint {
    bottom: calc(var(--app-footer-h) + 0.85rem + var(--safe-bottom));
  }
}
</style>
