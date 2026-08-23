<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import OrbitScene from '../components/OrbitScene.vue'
import AppHeader from '../components/AppHeader.vue'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import AlmanacPanel from '../components/AlmanacPanel.vue'
import { isEditableTarget } from '../composables/useContentGuard.js'
import {
  DAY_MS,
  beijingDayStartMs,
  beijingNoonJD,
  civilOfMs,
  daoYearFromXiYuan,
  formatLunar,
  formatSolar,
  getJieqiContext,
  moonAgeDays,
  moonPhaseFraction,
  phaseName
} from '../lib/calendar.js'
import { getFestivalsOn } from '../lib/festivals.js'
import { formatSuiXing } from '../lib/sky.js'

const DESKTOP_MQ = '(min-width: 721px)'
const MOBILE_HINT_KEY = 'dipper.mobileHintDismissed'

const currentMs = ref(Date.now())
const scrubOriginMs = ref(null)
const lixiangOpen = ref(typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches)
const isMobileLayout = ref(typeof window !== 'undefined' && !window.matchMedia(DESKTOP_MQ).matches)
const showMobileHint = ref(false)
const constellationMode = ref('east')
const eastLabels = ref(true)
const SKY_MODES = [
  { id: 'west', label: '西象' },
  { id: 'east-core', label: '古象纲' },
  { id: 'east', label: '古象繁' },
  { id: 'all', label: '全部' }
]

const orbitSceneRef = ref(null)
const almanacRef = ref(null)

function snapToNoon(ms) {
  const ymd = civilOfMs(ms)
  return beijingDayStartMs(ymd.y, ymd.m, ymd.d) + 12 * 3600 * 1000
}

function setDate(ms, snap = true) {
  currentMs.value = snap ? snapToNoon(ms) : ms
}

const ymd = computed(() => civilOfMs(currentMs.value))
const jd = computed(() => beijingNoonJD(ymd.value.y, ymd.value.m, ymd.value.d))
const solarText = computed(() => formatSolar(ymd.value.y, ymd.value.m, ymd.value.d))

const lunar = computed(() => {
  try {
    return formatLunar(ymd.value.y, ymd.value.m, ymd.value.d)
  } catch {
    return {
      text: '历法计算异常',
      mdText: '',
      isLeapMonth: false,
      ganzhi: { sx: '—', gan: '', zhi: '' }
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
  cancelAnimationFrame(inertiaId)
  scrubOriginMs.value = null
  constellationMode.value = 'east'
  eastLabels.value = true
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
      v-model:date-value="dateInputValue"
      :sky-modes="SKY_MODES"
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
        @scrub="onScrub"
      />
      <AlmanacPanel
        ref="almanacRef"
        :open="lixiangOpen"
        :solar-text="solarText"
        :lunar-main-text="lunarMainText"
        :is-leap-month="lunar.isLeapMonth"
        :dao-year-text="daoYearText"
        :sui-xing="suiXing"
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
    </main>
    <a
      class="github-link"
      href="https://github.com/adiudiuu/dipper"
      target="_blank"
      rel="noopener noreferrer"
      title="GitHub"
    >
      <svg class="github-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
      <span>GitHub</span>
    </a>
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

.github-link {
  position: fixed;
  left: calc(0.7rem + var(--safe-left));
  bottom: calc(0.55rem + var(--safe-bottom));
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.35rem 0.45rem;
  min-height: var(--tap-min);
  font-family: var(--font-sans);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: rgba(110, 154, 156, 0.42);
  text-decoration: none;
  text-shadow: none;
  pointer-events: auto;
  transition: color 0.18s;
}

.github-link:hover {
  color: rgba(110, 154, 156, 0.82);
}

.github-icon {
  width: 0.78rem;
  height: 0.78rem;
  flex: 0 0 auto;
  opacity: 0.9;
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
  bottom: calc(5.5rem + var(--safe-bottom));
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

@media (max-width: 640px) {
  .github-link {
    left: calc(0.45rem + var(--safe-left));
    bottom: calc(0.4rem + var(--safe-bottom));
    font-size: 0.52rem;
    letter-spacing: 0.1em;
  }

  .mobile-hint {
    bottom: calc(4.8rem + var(--safe-bottom));
  }
}
</style>
