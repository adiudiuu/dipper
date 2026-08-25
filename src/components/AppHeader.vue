<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({
  constellationMode: { type: String, default: 'east' },
  eastLabels: { type: Boolean, default: true },
  viewMode: { type: String, default: 'orbit' },
  dateValue: { type: String, default: '' },
  skyModes: { type: Array, default: () => [] },
  locations: { type: Array, default: () => [] },
  observerLat: { type: Number, default: 39.9 },
  observerLon: { type: Number, default: 116.4 },
  observerPlace: { type: String, default: '北京' },
  timePlaying: { type: Boolean, default: false },
  timeSpeedLabel: { type: String, default: '1小时/秒' },
  /** 岁差观测历元（公历年份，仅历象页） */
  epochYear: { type: Number, default: 2000 }
})

const emit = defineEmits([
  'update:constellationMode',
  'update:eastLabels',
  'update:viewMode',
  'update:dateValue',
  'update:observerLat',
  'update:observerLon',
  'update:observerPlace',
  'update:epochYear',
  'togglePlay',
  'cycleSpeed',
  'defaults',
  'addDays'
])

const route = useRoute()

const isHome = computed(() => route.path === '/')
const isBuTianGe = computed(() => route.path.startsWith('/butiange'))
const showToolsRow = computed(() => isHome.value || isBuTianGe.value)

/** 岁差年份格式化：公元 / 公元前 */
const epochText = computed(() => {
  const y = Math.round(props.epochYear)
  if (y < 0) return `公元前${-y}年`
  if (y === 0) return '公元1年'
  return `公元${y}年`
})

const navItems = [
  { to: '/', label: '历象', title: '历象日月星辰' },
  { to: '/butiange', label: '列宿', title: '列宿认星' },
  { to: '/timeline', label: '羲和', title: '羲和掌历象' }
]

function isNavActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const NARROW_MQ = '(max-width: 720px)'
const isNarrow = ref(typeof window !== 'undefined' && window.matchMedia(NARROW_MQ).matches)
const moreOpen = ref(false)
const locationOpen = ref(false)
const customLat = ref(props.observerLat)
const customLon = ref(props.observerLon)
const hasGeolocation = typeof navigator !== 'undefined' && !!navigator.geolocation

let narrowMq
let onNarrowMqChange

function closeMore() {
  moreOpen.value = false
}

function toggleMore() {
  moreOpen.value = !moreOpen.value
  if (!moreOpen.value) locationOpen.value = false
}

function selectLocation(loc) {
  emit('update:observerLat', loc.lat)
  emit('update:observerLon', loc.lon)
  emit('update:observerPlace', loc.name)
  customLat.value = loc.lat
  customLon.value = loc.lon
  locationOpen.value = false
}

function applyCustomLocation() {
  const lat = Math.max(-90, Math.min(90, customLat.value || 0))
  const lon = ((customLon.value || 0) % 360 + 540) % 360 - 180
  emit('update:observerLat', lat)
  emit('update:observerLon', lon)
  emit('update:observerPlace', `${lat.toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${lon.toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`)
  locationOpen.value = false
}

function useMyLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = Math.round(pos.coords.latitude * 10) / 10
      const lon = Math.round(pos.coords.longitude * 10) / 10
      emit('update:observerLat', lat)
      emit('update:observerLon', lon)
      emit('update:observerPlace', `${lat.toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${lon.toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`)
      customLat.value = lat
      customLon.value = lon
      locationOpen.value = false
    },
    () => { /* 权限拒绝等静默处理 */ },
    { timeout: 5000, enableHighAccuracy: false }
  )
}

function toggleLocation() {
  customLat.value = props.observerLat
  customLon.value = props.observerLon
  locationOpen.value = !locationOpen.value
}

function onDocClick(e) {
  if (locationOpen.value && !e.target.closest('.loc-wrap')) {
    locationOpen.value = false
  }
  if (moreOpen.value && !e.target.closest('.more-wrap') && !e.target.closest('.more-panel')) {
    moreOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  narrowMq = window.matchMedia(NARROW_MQ)
  isNarrow.value = narrowMq.matches
  onNarrowMqChange = () => {
    isNarrow.value = narrowMq.matches
    if (!narrowMq.matches) {
      moreOpen.value = false
    }
  }
  narrowMq.addEventListener('change', onNarrowMqChange)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  narrowMq?.removeEventListener('change', onNarrowMqChange)
})
</script>

<template>
  <header class="site-header">
    <div class="topbar-row">
      <RouterLink to="/" class="brand" title="返回历象主页">
        <img class="brand-logo" src="/logo.svg?v=2" width="36" height="36" alt="" aria-hidden="true">
        <div class="brand-text">
          <h1>七政</h1>
          <div class="sub">历象 · 授时 · 节气</div>
        </div>
      </RouterLink>

      <nav class="main-nav" aria-label="站点主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isNavActive(item.to) }"
          :title="item.title"
          :aria-current="isNavActive(item.to) ? 'page' : undefined"
        >{{ item.label }}</RouterLink>
      </nav>
    </div>

    <div v-if="showToolsRow" class="tools-row">
      <div class="tools-scroll">
        <template v-if="isHome">
          <div class="sky-mode" role="group" aria-label="星象层">
            <button
              v-for="m in skyModes"
              :key="m.id"
              type="button"
              class="sky-mode-btn"
              :class="{ active: constellationMode === m.id }"
              :aria-pressed="constellationMode === m.id"
              @click="emit('update:constellationMode', m.id)"
            >{{ m.label }}</button>
          </div>
          <div
            class="sky-mode sky-mode-labels"
            role="group"
            aria-label="星官之名"
          >
            <button
              type="button"
              class="sky-mode-btn"
              :class="{ active: eastLabels }"
              :aria-pressed="eastLabels"
              title="显示星官之名"
              aria-label="显示星官之名"
              @click="emit('update:eastLabels', true)"
            >题名</button>
            <button
              type="button"
              class="sky-mode-btn"
              :class="{ active: !eastLabels }"
              :aria-pressed="!eastLabels"
              title="隐藏星官之名"
              aria-label="隐藏星官之名"
              @click="emit('update:eastLabels', false)"
            >隐名</button>
          </div>

          <!-- 桌面：次要工具内联；窄屏收入「更多」面板 -->
          <div v-if="!isNarrow" class="tools-secondary tools-secondary--inline">
            <div class="view-toggle" role="group" aria-label="视角">
              <button
                type="button"
                class="sky-mode-btn"
                :class="{ active: viewMode === 'orbit' }"
                :aria-pressed="viewMode === 'orbit'"
                @click="emit('update:viewMode', 'orbit')"
              >轨道</button>
              <button
                type="button"
                class="sky-mode-btn"
                :class="{ active: viewMode === 'ground' }"
                :aria-pressed="viewMode === 'ground'"
                @click="emit('update:viewMode', 'ground')"
              >地面</button>
            </div>
            <div v-if="viewMode === 'ground'" class="loc-wrap">
              <button
                type="button"
                class="loc-btn"
                :title="`观测位置：${observerPlace}`"
                @click="toggleLocation"
              >
                <span class="loc-icon">&#9678;</span>
                <span class="loc-name">{{ observerPlace }}</span>
              </button>
              <div v-if="locationOpen" class="loc-popover">
                <div class="loc-section">
                  <div class="loc-section-title">预设城市</div>
                  <div class="loc-presets">
                    <button
                      v-for="loc in locations"
                      :key="loc.name"
                      type="button"
                      class="loc-preset-btn"
                      :class="{ active: observerPlace === loc.name }"
                      @click="selectLocation(loc)"
                    >{{ loc.name }}</button>
                  </div>
                </div>
                <div class="loc-section">
                  <div class="loc-section-title">自定义</div>
                  <div class="loc-custom">
                    <label class="loc-field">
                      <span>纬度</span>
                      <input
                        v-model.number="customLat"
                        type="number"
                        min="-90" max="90" step="0.1"
                        class="loc-input"
                        placeholder="39.9"
                      >
                    </label>
                    <label class="loc-field">
                      <span>经度</span>
                      <input
                        v-model.number="customLon"
                        type="number"
                        min="-180" max="180" step="0.1"
                        class="loc-input"
                        placeholder="116.4"
                      >
                    </label>
                    <button type="button" class="loc-apply" @click="applyCustomLocation">应用</button>
                  </div>
                </div>
                <button
                  v-if="hasGeolocation"
                  type="button"
                  class="loc-my"
                  @click="useMyLocation"
                >使用当前位置</button>
              </div>
            </div>
            <div v-if="viewMode === 'ground'" class="time-play" role="group" aria-label="时间加速播放">
              <button
                type="button"
                class="time-play-btn"
                :class="{ active: timePlaying }"
                :aria-pressed="timePlaying"
                :title="timePlaying ? '暂停时间加速' : '开始时间加速'"
                @click="emit('togglePlay')"
              >{{ timePlaying ? '暂停' : '播放' }}</button>
              <button
                type="button"
                class="time-play-btn time-play-speed"
                :title="`加速速度：${timeSpeedLabel}（点击切换）`"
                @click="emit('cycleSpeed')"
              >{{ timeSpeedLabel }}</button>
            </div>
            <button type="button" class="btn" title="恢复全部初始状态" @click="emit('defaults')">默认</button>
            <label class="date-wrap" title="跳转到指定公历日期">
              <input
                :value="dateValue"
                type="date"
                aria-label="选择公历日期"
                @input="emit('update:dateValue', $event.target.value)"
              >
            </label>
            <label
              class="epoch-wrap"
              title="岁差：北天极与冬至点相对恒星的缓慢漂移（约 2.6 万年一周）。拖动观察极星更替与冬至点西移。"
            >
              <span class="epoch-label">岁差</span>
              <input
                type="range"
                min="-2000" max="2100" step="1"
                :value="epochYear"
                aria-label="岁差年份"
                @input="emit('update:epochYear', Number($event.target.value))"
              >
              <span class="epoch-value">{{ epochText }}</span>
            </label>
          </div>

          <div class="day-nav day-nav--mobile" role="group" aria-label="换日">
            <button
              type="button"
              class="day-nav-btn"
              aria-label="上一日"
              @click="emit('addDays', -1)"
            >‹</button>
            <button
              type="button"
              class="day-nav-btn"
              aria-label="下一日"
              @click="emit('addDays', 1)"
            >›</button>
          </div>

          <div class="more-wrap">
            <button
              type="button"
              class="more-btn"
              :class="{ active: moreOpen }"
              :aria-expanded="moreOpen"
              aria-controls="header-more-panel"
              @click.stop="toggleMore"
            >{{ moreOpen ? '收起' : '更多' }}</button>
          </div>
        </template>

        <template v-else-if="isBuTianGe">
          <div class="sky-mode" role="group" aria-label="星象层">
            <button
              v-for="m in skyModes"
              :key="m.id"
              type="button"
              class="sky-mode-btn"
              :class="{ active: constellationMode === m.id }"
              :aria-pressed="constellationMode === m.id"
              @click="emit('update:constellationMode', m.id)"
            >{{ m.label }}</button>
          </div>
          <div
            class="sky-mode sky-mode-labels"
            role="group"
            aria-label="星官之名"
          >
            <button
              type="button"
              class="sky-mode-btn"
              :class="{ active: eastLabels }"
              :aria-pressed="eastLabels"
              title="显示星官之名"
              aria-label="显示星官之名"
              @click="emit('update:eastLabels', true)"
            >题名</button>
            <button
              type="button"
              class="sky-mode-btn"
              :class="{ active: !eastLabels }"
              :aria-pressed="!eastLabels"
              title="隐藏星官之名"
              aria-label="隐藏星官之名"
              @click="emit('update:eastLabels', false)"
            >隐名</button>
          </div>
        </template>
      </div>

      <div
        v-if="isHome && isNarrow && moreOpen"
        id="header-more-panel"
        class="more-panel"
        role="region"
        aria-label="更多工具"
      >
        <div class="view-toggle" role="group" aria-label="视角">
          <button
            type="button"
            class="sky-mode-btn"
            :class="{ active: viewMode === 'orbit' }"
            :aria-pressed="viewMode === 'orbit'"
            @click="emit('update:viewMode', 'orbit')"
          >轨道</button>
          <button
            type="button"
            class="sky-mode-btn"
            :class="{ active: viewMode === 'ground' }"
            :aria-pressed="viewMode === 'ground'"
            @click="emit('update:viewMode', 'ground')"
          >地面</button>
        </div>
        <div v-if="viewMode === 'ground'" class="loc-wrap">
          <button
            type="button"
            class="loc-btn"
            :title="`观测位置：${observerPlace}`"
            @click="toggleLocation"
          >
            <span class="loc-icon">&#9678;</span>
            <span class="loc-name">{{ observerPlace }}</span>
          </button>
          <div v-if="locationOpen" class="loc-popover">
            <div class="loc-section">
              <div class="loc-section-title">预设城市</div>
              <div class="loc-presets">
                <button
                  v-for="loc in locations"
                  :key="loc.name"
                  type="button"
                  class="loc-preset-btn"
                  :class="{ active: observerPlace === loc.name }"
                  @click="selectLocation(loc)"
                >{{ loc.name }}</button>
              </div>
            </div>
            <div class="loc-section">
              <div class="loc-section-title">自定义</div>
              <div class="loc-custom">
                <label class="loc-field">
                  <span>纬度</span>
                  <input
                    v-model.number="customLat"
                    type="number"
                    min="-90" max="90" step="0.1"
                    class="loc-input"
                    placeholder="39.9"
                  >
                </label>
                <label class="loc-field">
                  <span>经度</span>
                  <input
                    v-model.number="customLon"
                    type="number"
                    min="-180" max="180" step="0.1"
                    class="loc-input"
                    placeholder="116.4"
                  >
                </label>
                <button type="button" class="loc-apply" @click="applyCustomLocation">应用</button>
              </div>
            </div>
            <button
              v-if="hasGeolocation"
              type="button"
              class="loc-my"
              @click="useMyLocation"
            >使用当前位置</button>
          </div>
        </div>
        <div v-if="viewMode === 'ground'" class="time-play" role="group" aria-label="时间加速播放">
          <button
            type="button"
            class="time-play-btn"
            :class="{ active: timePlaying }"
            :aria-pressed="timePlaying"
            :title="timePlaying ? '暂停时间加速' : '开始时间加速'"
            @click="emit('togglePlay')"
          >{{ timePlaying ? '暂停' : '播放' }}</button>
          <button
            type="button"
            class="time-play-btn time-play-speed"
            :title="`加速速度：${timeSpeedLabel}（点击切换）`"
            @click="emit('cycleSpeed')"
          >{{ timeSpeedLabel }}</button>
        </div>
        <button type="button" class="btn" title="恢复全部初始状态" @click="emit('defaults'); closeMore()">默认</button>
        <label class="date-wrap" title="跳转到指定公历日期">
          <input
            :value="dateValue"
            type="date"
            aria-label="选择公历日期"
            @input="emit('update:dateValue', $event.target.value)"
          >
        </label>
        <label
          class="epoch-wrap"
          title="岁差：北天极与冬至点相对恒星的缓慢漂移（约 2.6 万年一周）。拖动观察极星更替与冬至点西移。"
        >
          <span class="epoch-label">岁差</span>
          <input
            type="range"
            min="-2000" max="2100" step="1"
            :value="epochYear"
            aria-label="岁差年份"
            @input="emit('update:epochYear', Number($event.target.value))"
          >
          <span class="epoch-value">{{ epochText }}</span>
        </label>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding:
    calc(1rem + var(--safe-top))
    calc(1.5rem + var(--safe-right))
    0.65rem
    calc(1.5rem + var(--safe-left));
  background: linear-gradient(
    180deg,
    rgba(8, 14, 22, 0.88) 0%,
    rgba(8, 14, 22, 0.32) 60%,
    rgba(8, 14, 22, 0) 100%
  );
  backdrop-filter: blur(8px);
}

.topbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.72rem;
  min-width: 0;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.18s;
}

.brand:hover {
  opacity: 0.92;
}

.brand-logo {
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.42rem;
  box-shadow: 0 0 0 1px rgba(90, 138, 140, 0.22);
}

.brand-text {
  min-width: 0;
}

.brand h1 {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.28rem;
  letter-spacing: 0.2em;
  color: var(--xuan-zhi);
  line-height: 1.2;
}

.brand .sub {
  margin-top: 0.22rem;
  font-size: 0.68rem;
  color: var(--xuan-zhi-mute);
  letter-spacing: 0.12em;
}

.main-nav {
  display: inline-flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-left: auto;
}

.tools-row {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  align-items: stretch;
  min-height: 2.05rem;
  padding-top: 0.05rem;
}

.tools-scroll {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  align-items: center;
  min-height: 2.05rem;
}

.tools-secondary {
  display: inline-flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  align-items: center;
}

.day-nav--mobile {
  display: none;
}

.more-wrap {
  display: none;
}

.more-btn {
  appearance: none;
  border: 1px solid rgba(184, 150, 74, 0.4);
  background: rgba(184, 150, 74, 0.08);
  color: var(--dan-jin);
  font-family: var(--font-sans);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  padding: 0 0.75rem;
  height: 2.05rem;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
}

.more-btn.active {
  border-color: rgba(184, 150, 74, 0.65);
  background: rgba(184, 150, 74, 0.16);
}

.more-panel {
  display: none;
}

.sky-mode {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
  height: 2.05rem;
}

.sky-mode-btn {
  appearance: none;
  border: none;
  border-right: 1px solid rgba(90, 138, 140, 0.16);
  background: transparent;
  color: rgba(233, 228, 214, 0.55);
  font-family: var(--font-sans);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  padding: 0 0.55rem 0 0.68rem;
  cursor: pointer;
  transition: color 0.18s, background 0.18s;
}

.sky-mode-btn:last-child {
  border-right: none;
}

.sky-mode-btn:hover {
  color: rgba(233, 228, 214, 0.88);
  background: rgba(90, 138, 140, 0.08);
}

.sky-mode-btn.active {
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.1);
}

.sky-mode-labels {
  margin-left: 0.15rem;
}

.view-toggle {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
  height: 2.05rem;
}

.day-nav {
  display: none;
  align-items: stretch;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
}

.day-nav-btn {
  appearance: none;
  border: none;
  border-right: 1px solid rgba(90, 138, 140, 0.16);
  background: transparent;
  color: rgba(233, 228, 214, 0.72);
  font-family: var(--font-mono);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.18s, background 0.18s;
}

.day-nav-btn:last-child {
  border-right: none;
}

.day-nav-btn:hover {
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.08);
}

.btn {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(14, 22, 32, 0.72);
  color: var(--xuan-zhi-dim);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  padding: 0.42rem 0.9rem;
  height: 2.05rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.btn:hover {
  border-color: rgba(184, 150, 74, 0.55);
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.06);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.45);
  color: rgba(201, 194, 176, 0.58);
  font-family: var(--font-sans);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  padding: 0.42rem 0.72rem;
  height: 2.05rem;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.nav-link:hover {
  border-color: rgba(184, 150, 74, 0.45);
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.06);
}

.nav-link.active {
  border-color: rgba(184, 150, 74, 0.55);
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.12);
  box-shadow: inset 0 0 0 1px rgba(184, 150, 74, 0.08);
}

.date-wrap {
  display: inline-flex;
  align-items: center;
}

.date-wrap input[type='date'] {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(14, 22, 32, 0.72);
  color: var(--xuan-zhi-dim);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  padding: 0.38rem 0.6rem;
  height: 2.05rem;
  color-scheme: dark;
  cursor: pointer;
  transition: border-color 0.2s;
}

.date-wrap input[type='date']:hover {
  border-color: rgba(90, 138, 140, 0.5);
}

.date-wrap input[type='date']:focus {
  outline: none;
  border-color: var(--shi-qing);
  color: var(--xuan-zhi);
}

/* —— 岁差滑杆 —— */
.epoch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.epoch-label {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: var(--xuan-zhi-mute);
}

.epoch-wrap input[type='range'] {
  width: 7.5rem;
  min-height: 2.05rem;
  accent-color: var(--dan-jin);
  cursor: pointer;
  color-scheme: dark;
}

.epoch-wrap input[type='range']:focus {
  outline: none;
}

.epoch-value {
  min-width: 4.6em;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.02em;
  color: var(--shi-qing);
  white-space: nowrap;
}

@media (max-width: 720px) {
  .site-header {
    gap: 0.35rem;
    padding:
      calc(0.55rem + var(--safe-top))
      calc(0.55rem + var(--safe-right))
      0.4rem
      calc(0.55rem + var(--safe-left));
  }

  .topbar-row {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.4rem;
  }

  .brand {
    flex: 0 0 auto;
    gap: 0.4rem;
    max-width: 42%;
  }

  .brand h1 {
    font-size: 1rem;
    letter-spacing: 0.14em;
  }

  /* ≤720 即藏副标，给 历象|列宿|羲和 留宽 */
  .brand .sub {
    display: none;
  }

  .brand-logo {
    width: 1.75rem;
    height: 1.75rem;
  }

  .main-nav {
    margin-left: 0;
    flex: 1 1 auto;
    flex-wrap: nowrap;
    justify-content: stretch;
    min-width: 0;
    gap: 0.28rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .nav-link {
    flex: none;
    width: 100%;
    min-width: 0;
    max-width: none;
    padding: 0 0.2rem;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }

  .tools-row {
    width: 100%;
    min-height: auto;
    gap: 0.4rem;
  }

  .tools-scroll {
    width: 100%;
    flex-wrap: nowrap;
    gap: 0.4rem;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
    touch-action: pan-x;
    padding: 0.15rem 0.1rem 0.4rem;
    margin: 0;
  }

  .tools-scroll::-webkit-scrollbar {
    display: none;
  }

  .sky-mode,
  .sky-mode-labels,
  .view-toggle,
  .day-nav,
  .time-play,
  .loc-wrap,
  .btn,
  .date-wrap,
  .epoch-wrap,
  .more-wrap {
    flex: 0 0 auto;
  }

  .sky-mode,
  .sky-mode-labels,
  .view-toggle,
  .day-nav,
  .time-play {
    height: auto;
    min-height: var(--tap-min);
  }

  .sky-mode-btn,
  .day-nav-btn,
  .time-play-btn,
  .btn,
  .loc-btn,
  .more-btn {
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    height: auto;
  }

  .nav-link {
    min-width: 0;
    min-height: var(--tap-min);
    height: auto;
  }

  .sky-mode-btn,
  .time-play-btn {
    flex: 0 0 auto;
    white-space: nowrap;
    font-size: 0.68rem;
    padding: 0 0.72rem;
  }

  .day-nav--mobile {
    display: inline-flex;
  }

  .more-wrap {
    display: inline-flex;
    position: sticky;
    right: 0;
    z-index: 2;
    margin-left: 0.15rem;
    padding-left: 0.25rem;
    background: linear-gradient(
      90deg,
      rgba(8, 14, 22, 0) 0%,
      rgba(8, 14, 22, 0.92) 28%
    );
  }

  .more-btn {
    padding: 0 0.85rem;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    box-shadow: -6px 0 10px rgba(8, 14, 22, 0.35);
  }

  .more-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
    width: 100%;
    padding: 0.55rem 0.6rem;
    border: 1px solid rgba(90, 138, 140, 0.28);
    border-radius: 0.45rem;
    background: rgba(10, 16, 24, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  }

  .more-panel .view-toggle,
  .more-panel .time-play {
    height: auto;
    min-height: var(--tap-min);
  }

  .more-panel .date-wrap {
    flex: 1 1 8.5rem;
    min-width: 8.5rem;
  }

  .more-panel .date-wrap input[type='date'] {
    width: 100%;
    min-height: var(--tap-min);
    height: auto;
    font-size: 0.78rem;
  }

  .epoch-wrap {
    min-height: var(--tap-min);
  }

  .epoch-wrap input[type='range'] {
    width: 6.5rem;
    min-height: var(--tap-min);
  }

  .more-panel .epoch-wrap {
    flex: 1 1 12rem;
    min-width: 0;
  }

  .more-panel .epoch-wrap input[type='range'] {
    flex: 1 1 auto;
    width: auto;
    min-width: 6.5rem;
  }

  .loc-btn {
    height: auto;
    padding: 0 0.65rem;
  }

  .loc-name {
    max-width: 4.2em;
  }

  .loc-popover {
    position: fixed;
    top: auto;
    right: calc(0.75rem + var(--safe-right));
    left: calc(0.75rem + var(--safe-left));
    bottom: calc(var(--app-footer-h) + 0.65rem + var(--safe-bottom));
    min-width: 0;
    width: auto;
    max-height: min(70vh, calc(100dvh - 6rem - var(--safe-top) - var(--safe-bottom)));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .loc-preset-btn,
  .loc-apply,
  .loc-my {
    min-height: var(--tap-min);
    padding: 0.45rem 0.7rem;
  }

  .loc-input {
    min-height: var(--tap-min);
    width: 5.5em;
    font-size: 0.78rem;
  }
}

@media (max-width: 480px) {
  .brand {
    max-width: 36%;
  }

  .brand h1 {
    font-size: 0.92rem;
    letter-spacing: 0.12em;
  }

  .nav-link {
    padding: 0 0.12rem;
    font-size: 0.58rem;
    letter-spacing: 0.06em;
  }

  .sky-mode-btn {
    font-size: 0.64rem;
    padding: 0 0.58rem;
  }

  .more-panel {
    gap: 0.38rem;
    padding: 0.5rem 0.5rem;
  }
}

@media (max-width: 720px) and (orientation: landscape) {
  .site-header {
    gap: 0.28rem;
    padding:
      calc(0.35rem + var(--safe-top))
      calc(0.65rem + var(--safe-right))
      0.28rem
      calc(0.65rem + var(--safe-left));
  }

  .tools-scroll {
    gap: 0.32rem;
    padding-bottom: 0.22rem;
  }
}

/* PR: ground view / location / time play */
.loc-wrap {
  position: relative;
}

.loc-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(14, 22, 32, 0.72);
  color: var(--xuan-zhi-dim);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  padding: 0.32rem 0.7rem;
  height: 2.05rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.loc-btn:hover {
  border-color: rgba(184, 150, 74, 0.5);
  color: var(--dan-jin);
}

.loc-icon {
  font-size: 0.6rem;
  color: var(--shi-qing);
}

.loc-name {
  max-width: 5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loc-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 100;
  min-width: 240px;
  padding: 0.7rem;
  border: 1px solid rgba(90, 138, 140, 0.3);
  border-radius: 6px;
  background: rgba(12, 20, 28, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
  color: var(--xuan-zhi);
}

.loc-section {
  margin-bottom: 0.6rem;
}

.loc-section-title {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--xuan-zhi-mute);
  margin-bottom: 0.4rem;
}

.loc-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.loc-preset-btn {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(20, 30, 42, 0.55);
  color: rgba(201, 194, 176, 0.65);
  font-family: var(--font-sans);
  font-size: 0.65rem;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.loc-preset-btn:hover {
  border-color: rgba(184, 150, 74, 0.4);
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.06);
}

.loc-preset-btn.active {
  border-color: rgba(184, 150, 74, 0.55);
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.1);
}

.loc-custom {
  display: flex;
  gap: 0.35rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.loc-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.loc-field span {
  font-size: 0.55rem;
  color: var(--xuan-zhi-mute);
  letter-spacing: 0.06em;
}

.loc-input {
  appearance: none;
  width: 5em;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(8, 14, 22, 0.72);
  color: var(--xuan-zhi);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  padding: 0.25rem 0.4rem;
  border-radius: 3px;
}

.loc-input:focus {
  outline: none;
  border-color: var(--shi-qing);
}

.loc-apply {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(20, 30, 42, 0.55);
  color: var(--xuan-zhi-dim);
  font-family: var(--font-sans);
  font-size: 0.65rem;
  padding: 0.25rem 0.65rem;
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.loc-apply:hover {
  border-color: rgba(184, 150, 74, 0.5);
  color: var(--dan-jin);
}

.loc-my {
  display: block;
  width: 100%;
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(20, 30, 42, 0.4);
  color: var(--shi-qing);
  font-family: var(--font-sans);
  font-size: 0.66rem;
  padding: 0.35rem;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.loc-my:hover {
  border-color: rgba(160, 208, 196, 0.5);
  background: rgba(90, 138, 140, 0.1);
}

.time-play {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
  height: 2.05rem;
}

.time-play-btn {
  appearance: none;
  border: none;
  border-right: 1px solid rgba(90, 138, 140, 0.16);
  background: transparent;
  color: rgba(233, 228, 214, 0.62);
  font-family: var(--font-sans);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  padding: 0 0.6rem 0 0.72rem;
  cursor: pointer;
  transition: color 0.18s, background 0.18s;
}

.time-play-btn:last-child {
  border-right: none;
}

.time-play-btn:hover {
  color: rgba(233, 228, 214, 0.9);
  background: rgba(90, 138, 140, 0.08);
}

.time-play-btn.active {
  color: var(--dan-jin);
  background: rgba(184, 150, 74, 0.12);
}

.time-play-speed {
  color: var(--shi-qing);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.time-play-speed:hover {
  color: rgba(160, 208, 196, 0.95);
}

/* 选点/播放控件的窄屏覆盖须在基础规则之后 */
@media (max-width: 720px) {
  .loc-btn {
    height: auto;
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    padding: 0 0.65rem;
  }

  .loc-name {
    max-width: 4.2em;
  }

  .loc-popover {
    position: fixed;
    top: auto;
    right: calc(0.75rem + var(--safe-right));
    left: calc(0.75rem + var(--safe-left));
    bottom: calc(var(--app-footer-h) + 0.65rem + var(--safe-bottom));
    min-width: 0;
    width: auto;
    max-height: min(70vh, calc(100dvh - 6rem - var(--safe-top) - var(--safe-bottom)));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    z-index: 100;
  }

  .loc-preset-btn,
  .loc-apply,
  .loc-my {
    min-height: var(--tap-min);
    padding: 0.45rem 0.7rem;
  }

  .loc-input {
    min-height: var(--tap-min);
    width: 5.5em;
    font-size: 0.78rem;
  }

  .time-play {
    height: auto;
    min-height: var(--tap-min);
  }

  .time-play-btn {
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    padding: 0 0.68rem;
    font-size: 0.66rem;
  }

  .more-panel .btn {
    min-height: var(--tap-min);
    height: auto;
  }
}
</style>
