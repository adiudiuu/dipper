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

const currentMs = ref(Date.now())
const scrubOriginMs = ref(null)
const lixiangOpen = ref(true)
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
  lixiangOpen.value = true
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

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  setDate(Date.now())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  cancelAnimationFrame(inertiaId)
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
    />
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
  z-index: 1;
  height: 100%;
  min-height: 0;
}
</style>
