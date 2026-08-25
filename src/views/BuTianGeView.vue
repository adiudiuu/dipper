<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import BuTianSkyScene from '../components/BuTianSkyScene.vue'
import CultureCard from '../components/CultureCard.vue'
import {
  BU_TIAN_GE_LINES,
  BU_TIAN_GE_SECTIONS,
  buTianGeStats,
  getConstellationsForLine
} from '../lib/buTianGe.js'
import { CONSTELLATIONS } from '../lib/sky.js'

const SKY_MODES = [
  { id: 'west', label: '西象' },
  { id: 'east', label: '古象' },
  { id: 'all', label: '全部' }
]

const constellationMode = ref('east')
const activeIndex = ref(0)
const westActiveName = ref('')
const lyricsRef = ref(null)
const westListRef = ref(null)
const lineRefs = ref([])
const westItemRefs = ref({})
const showLabels = ref(true)
const cultureOpen = ref(false)
const cultureName = ref('')
const cultureData = ref(null)
const scrollSyncLock = ref(false)
/** 全部模式下最近一次点选侧：east | west */
const focusSide = ref('east')

const MOBILE_MQ = '(max-width: 720px)'
const isMobileLayout = ref(typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches)
/** 手机端：星空 | 歌诀 面板切换 */
const mobilePane = ref('sky')

let mobileMq
let onMobileMqChange

const stats = buTianGeStats()
const showEastPanel = computed(() => constellationMode.value !== 'west')
const showWestPanel = computed(() => constellationMode.value !== 'east')
const isAllMode = computed(() => constellationMode.value === 'all')

const westList = computed(() =>
  CONSTELLATIONS.filter((c) => c.layer === 'west').map((c) => ({
    name: c.name,
    tier: c.tier || 'major',
    blurb: westBlurb(c),
    latin: westLatin(c)
  }))
)

const westStats = computed(() => {
  const list = westList.value
  const major = list.filter((c) => c.tier === 'major').length
  return { total: list.length, major }
})

const activeLine = computed(() => BU_TIAN_GE_LINES[activeIndex.value] ?? null)

const highlightNames = computed(() => {
  const mode = constellationMode.value
  if (mode === 'west') {
    return westActiveName.value ? [westActiveName.value] : []
  }
  if (mode === 'east') {
    return activeLine.value ? getConstellationsForLine(activeLine.value) : []
  }
  // all：跟最近点选侧
  if (focusSide.value === 'west') {
    return westActiveName.value ? [westActiveName.value] : []
  }
  return activeLine.value ? getConstellationsForLine(activeLine.value) : []
})

const skyCaption = computed(() => {
  const mode = constellationMode.value
  if (mode === 'west' || (mode === 'all' && focusSide.value === 'west')) {
    if (!westActiveName.value) {
      return { badge: mode === 'all' ? '全部·西象' : '西象', names: '点选右侧星座高亮' }
    }
    const item = westList.value.find((c) => c.name === westActiveName.value)
    return {
      badge: item?.tier === 'major' ? '西象·主要' : '西象',
      names: westActiveName.value
    }
  }
  if (!activeLine.value) {
    return mode === 'all' ? { badge: '全部·古象', names: '点选歌诀或西座' } : null
  }
  return {
    badge: mode === 'all' ? `全部 · ${activeLine.value.sectionTitle}` : activeLine.value.sectionTitle,
    names: getConstellationsForLine(activeLine.value).join(' · ')
  }
})

const panelAria = computed(() => {
  if (constellationMode.value === 'west') return '西象认星'
  if (constellationMode.value === 'all') return '古象与西象说明'
  return '步天歌歌诀'
})

const skyPanelAria = computed(() => {
  if (constellationMode.value === 'west') return '西象星空'
  if (constellationMode.value === 'all') return '古象与西象星空'
  return '古象星空'
})

function westBlurb(c) {
  const cul = c.culture
  if (!cul) return ''
  return cul.modernRef || cul.origin || cul.myth || ''
}

function westLatin(c) {
  const origin = c.culture?.origin || ''
  const m = origin.match(/拉丁名\s+([^，,]+)/)
  return m ? m[1].trim() : ''
}

function lineFlatIndex(lineId) {
  return BU_TIAN_GE_LINES.findIndex((l) => l.id === lineId)
}

function setLineRef(el, lineId) {
  if (!el) return
  const idx = lineFlatIndex(lineId)
  if (idx >= 0) lineRefs.value[idx] = el
}

function setWestItemRef(el, name) {
  if (!el) return
  westItemRefs.value[name] = el
}

function selectLine(flatIndex, scrollIntoView = true) {
  if (flatIndex < 0 || flatIndex >= BU_TIAN_GE_LINES.length) return
  activeIndex.value = flatIndex
  focusSide.value = 'east'
  westActiveName.value = ''
  if (scrollIntoView) {
    scrollSyncLock.value = true
    nextTick(() => {
      const el = lineRefs.value[flatIndex]
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      window.setTimeout(() => {
        scrollSyncLock.value = false
      }, 420)
    })
  }
}

function selectWest(name, scrollIntoView = true) {
  const next = westActiveName.value === name ? '' : name
  westActiveName.value = next
  focusSide.value = 'west'
  if (scrollIntoView && westActiveName.value) {
    nextTick(() => {
      westItemRefs.value[name]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  }
}

function stepLine(delta) {
  selectLine(activeIndex.value + delta)
}

function stepWest(delta) {
  const list = westList.value
  if (!list.length) return
  const cur = list.findIndex((c) => c.name === westActiveName.value)
  let next = cur + delta
  if (cur < 0) next = delta > 0 ? 0 : list.length - 1
  if (next < 0) next = 0
  if (next >= list.length) next = list.length - 1
  westActiveName.value = list[next].name
  focusSide.value = 'west'
  nextTick(() => {
    westItemRefs.value[list[next].name]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    })
  })
}

function onCultureOpen(payload) {
  cultureName.value = payload.name
  cultureData.value = payload.culture
  cultureOpen.value = true
}

function closeCulture() {
  cultureOpen.value = false
}

watch(constellationMode, (mode) => {
  if (mode === 'west') focusSide.value = 'west'
  else if (mode === 'east') focusSide.value = 'east'
})

watch(showEastPanel, (show) => {
  if (!show || !observer) return
  nextTick(() => {
    lineRefs.value.forEach((el) => {
      if (el) observer.observe(el)
    })
  })
})

let observer = null

onMounted(() => {
  mobileMq = window.matchMedia(MOBILE_MQ)
  isMobileLayout.value = mobileMq.matches
  onMobileMqChange = () => {
    isMobileLayout.value = mobileMq.matches
  }
  mobileMq.addEventListener('change', onMobileMqChange)

  observer = new IntersectionObserver(
    (entries) => {
      if (scrollSyncLock.value || !showEastPanel.value) return
      if (isAllMode.value && focusSide.value === 'west') return
      const visible = entries
        .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.55)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (!visible.length) return
      const idx = Number(visible[0].target.dataset.index)
      if (!Number.isNaN(idx) && idx !== activeIndex.value) {
        activeIndex.value = idx
        focusSide.value = 'east'
        westActiveName.value = ''
      }
    },
    {
      root: lyricsRef.value,
      threshold: [0.45, 0.55, 0.7]
    }
  )
  nextTick(() => {
    lineRefs.value.forEach((el) => {
      if (el) observer.observe(el)
    })
  })
})

onBeforeUnmount(() => {
  mobileMq?.removeEventListener('change', onMobileMqChange)
  observer?.disconnect()
})
</script>

<template>
  <div class="butiange-page">
    <SpaceBackdrop />
    <AppHeader
      v-model:constellation-mode="constellationMode"
      v-model:east-labels="showLabels"
      :sky-modes="SKY_MODES"
    />

    <div
      v-if="isMobileLayout"
      class="mobile-pane-tabs"
      role="tablist"
      aria-label="列宿面板"
    >
      <button
        type="button"
        role="tab"
        class="pane-tab"
        :class="{ active: mobilePane === 'sky' }"
        :aria-selected="mobilePane === 'sky'"
        @click="mobilePane = 'sky'"
      >星空</button>
      <button
        type="button"
        role="tab"
        class="pane-tab"
        :class="{ active: mobilePane === 'lyrics' }"
        :aria-selected="mobilePane === 'lyrics'"
        @click="mobilePane = 'lyrics'"
      >{{ constellationMode === 'west' ? '星座' : constellationMode === 'all' ? '说明' : '歌诀' }}</button>
    </div>

    <main
      class="split-layout"
      :class="{
        'is-mobile': isMobileLayout,
        'pane-sky': isMobileLayout && mobilePane === 'sky',
        'pane-lyrics': isMobileLayout && mobilePane === 'lyrics'
      }"
    >
      <section
        class="sky-panel glass-panel"
        :aria-label="skyPanelAria"
      >
        <BuTianSkyScene
          :constellation-mode="constellationMode"
          :highlight-names="highlightNames"
          :show-labels="showLabels"
          @constellation-click="onCultureOpen"
        />
        <div v-if="skyCaption" class="sky-caption glass-caption">
          <span class="cap-badge">{{ skyCaption.badge }}</span>
          <span class="cap-names">{{ skyCaption.names }}</span>
        </div>
      </section>

      <section
        class="lyrics-panel glass-panel"
        :aria-label="panelAria"
      >
        <div class="lyrics-head">
          <span v-if="isAllMode" class="lyrics-stat">
            古象 {{ stats.lines }} 句 · 西象 IAU {{ westStats.total }}
          </span>
          <span v-else-if="showEastPanel" class="lyrics-stat">
            共 {{ stats.lines }} 句 · {{ stats.constellations }} 官
          </span>
          <span v-else class="lyrics-stat">
            IAU {{ westStats.total }} 座 · 主要 {{ westStats.major }}
          </span>
          <div
            v-if="showEastPanel && !isAllMode"
            class="line-nav"
            role="group"
            aria-label="逐句浏览"
          >
            <button type="button" class="nav-btn" aria-label="上一句" @click="stepLine(-1)">‹</button>
            <span class="nav-pos">{{ activeIndex + 1 }} / {{ stats.lines }}</span>
            <button type="button" class="nav-btn" aria-label="下一句" @click="stepLine(1)">›</button>
          </div>
          <div
            v-else-if="showWestPanel && !isAllMode"
            class="line-nav"
            role="group"
            aria-label="逐座浏览"
          >
            <button type="button" class="nav-btn" aria-label="上一座" @click="stepWest(-1)">‹</button>
            <span class="nav-pos">
              {{
                westActiveName
                  ? `${westList.findIndex((c) => c.name === westActiveName) + 1} / ${westStats.total}`
                  : `— / ${westStats.total}`
              }}
            </span>
            <button type="button" class="nav-btn" aria-label="下一座" @click="stepWest(1)">›</button>
          </div>
          <div
            v-else-if="isAllMode"
            class="line-nav"
            role="group"
            aria-label="当前焦点浏览"
          >
            <template v-if="focusSide === 'east'">
              <button type="button" class="nav-btn" aria-label="上一句" @click="stepLine(-1)">‹</button>
              <span class="nav-pos">古 {{ activeIndex + 1 }}/{{ stats.lines }}</span>
              <button type="button" class="nav-btn" aria-label="下一句" @click="stepLine(1)">›</button>
            </template>
            <template v-else>
              <button type="button" class="nav-btn" aria-label="上一座" @click="stepWest(-1)">‹</button>
              <span class="nav-pos">
                西
                {{
                  westActiveName
                    ? `${westList.findIndex((c) => c.name === westActiveName) + 1}/${westStats.total}`
                    : `—/${westStats.total}`
                }}
              </span>
              <button type="button" class="nav-btn" aria-label="下一座" @click="stepWest(1)">›</button>
            </template>
          </div>
        </div>

        <div ref="lyricsRef" class="lyrics-scroll">
          <!-- 古象：步天歌 -->
          <template v-if="showEastPanel">
            <article
              v-for="section in BU_TIAN_GE_SECTIONS"
              :key="section.id"
              class="lyrics-section"
            >
              <header class="section-head">
                <h2 class="section-title">
                  <template v-if="isAllMode">古象 · </template>{{ section.title }}
                </h2>
                <span v-if="section.subtitle" class="section-sub">{{ section.subtitle }}</span>
              </header>
              <button
                v-for="line in section.lines"
                :key="line.id"
                :ref="(el) => setLineRef(el, line.id)"
                type="button"
                class="lyric-line"
                :class="{ active: lineFlatIndex(line.id) === activeIndex && focusSide === 'east' }"
                :data-index="lineFlatIndex(line.id)"
                @click="selectLine(lineFlatIndex(line.id), false)"
              >
                <p class="verse">{{ line.verse }}</p>
                <p class="note">{{ line.note }}</p>
                <div class="line-tags">
                  <span
                    v-for="name in line.constellations"
                    :key="name"
                    class="tag"
                  >{{ name }}</span>
                </div>
              </button>
            </article>
          </template>

          <!-- 西象：认星列表 -->
          <article v-if="showWestPanel" class="lyrics-section">
            <header class="section-head">
              <h2 class="section-title">
                <template v-if="isAllMode">西象 · </template>西象星座
              </h2>
              <span class="section-sub">点选高亮 · 题名/隐名对当前可见层生效</span>
            </header>
            <button
              v-for="item in westList"
              :key="item.name"
              :ref="(el) => setWestItemRef(el, item.name)"
              type="button"
              class="lyric-line west-line"
              :class="{ active: westActiveName === item.name && focusSide === 'west' }"
              @click="selectWest(item.name, false)"
            >
              <div class="west-row">
                <p class="verse">{{ item.name }}</p>
                <span
                  class="tier-badge"
                  :class="{ major: item.tier === 'major' }"
                >{{ item.tier === 'major' ? '主要' : '次要' }}</span>
              </div>
              <p v-if="item.latin" class="latin">{{ item.latin }}</p>
              <p v-if="item.blurb" class="note">{{ item.blurb }}</p>
            </button>
          </article>
        </div>

        <footer class="lyrics-foot">
          <span v-if="isAllMode">古象据《步天歌》· 西象据 IAU 88 · 教学认星，非占卜</span>
          <span v-else-if="showEastPanel">歌诀据《步天歌》节录改写，并补常见附座 · 非占卜预测</span>
          <span v-else>西象据 IAU 88 星座示意折线 · 教学认星，非占卜</span>
          <span v-if="showEastPanel && !isAllMode" class="foot-future">朗读（TTS）规划中</span>
        </footer>
      </section>
    </main>

    <CultureCard
      :open="cultureOpen"
      :name="cultureName"
      :culture="cultureData"
      @close="closeCulture"
    />
  </div>
</template>

<style scoped>
.butiange-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  isolation: isolate;
  color: var(--xuan-zhi-dim, #c9c2b0);
}

.glass-panel {
  --panel-bg: rgba(8, 14, 22, 0.82);
  --panel-border: rgba(90, 138, 140, 0.28);
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
}

.split-layout {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(17rem, 0.85fr);
  gap: 0.75rem;
  padding:
    0.65rem
    calc(0.85rem + var(--safe-right))
    calc(0.55rem + var(--app-footer-h))
    calc(0.85rem + var(--safe-left));
}

.mobile-pane-tabs {
  display: none;
}

.sky-panel {
  position: relative;
  min-height: 0;
  border-radius: 0.55rem;
  overflow: hidden;
}

.sky-caption {
  position: absolute;
  left: 0.65rem;
  bottom: 0.65rem;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.45rem 0.65rem;
  max-width: min(92%, 28rem);
  padding: 0.4rem 0.65rem;
  border-radius: 0.4rem;
  pointer-events: none;
}

.glass-caption {
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(8, 14, 22, 0.72);
  backdrop-filter: blur(8px);
}

.cap-badge {
  font-size: 0.52rem;
  letter-spacing: 0.16em;
  color: rgba(110, 154, 156, 0.85);
}

.cap-names {
  font-family: var(--font-serif);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: rgba(233, 228, 214, 0.88);
}

.lyrics-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 0.55rem;
  overflow: hidden;
}

.lyrics-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid rgba(90, 138, 140, 0.16);
}

.lyrics-stat {
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.55);
}

.line-nav {
  display: flex;
  align-items: center;
  gap: 0.28rem;
}

.nav-btn {
  appearance: none;
  width: 1.55rem;
  height: 1.55rem;
  border: 1px solid rgba(90, 138, 140, 0.28);
  border-radius: 0.28rem;
  background: rgba(8, 14, 22, 0.45);
  color: rgba(201, 194, 176, 0.7);
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
}

.nav-btn:hover {
  border-color: rgba(196, 164, 90, 0.4);
  color: #c4a45a;
}

.nav-pos {
  min-width: 3.6rem;
  text-align: center;
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: rgba(201, 194, 176, 0.55);
}

.lyrics-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0.55rem 0.65rem 0.75rem;
  -webkit-overflow-scrolling: touch;
}

.lyrics-section {
  margin-bottom: 0.85rem;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 0.15rem 0 0.45rem;
  padding: 0 0.15rem;
}

.section-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  color: rgba(110, 154, 156, 0.9);
}

.section-sub {
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.45);
}

.lyric-line {
  appearance: none;
  display: block;
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 0.42rem;
  background: transparent;
  padding: 0.55rem 0.6rem;
  margin-bottom: 0.35rem;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s;
  -webkit-tap-highlight-color: transparent;
}

.lyric-line:hover {
  background: rgba(90, 138, 140, 0.06);
}

.lyric-line.active {
  border-color: rgba(184, 150, 74, 0.35);
  background: rgba(184, 150, 74, 0.08);
}

.west-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.tier-badge {
  flex: 0 0 auto;
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  padding: 0.1rem 0.32rem;
  border: 1px solid rgba(90, 138, 140, 0.2);
  border-radius: 0.2rem;
  color: rgba(201, 194, 176, 0.45);
}

.tier-badge.major {
  border-color: rgba(184, 150, 74, 0.28);
  color: rgba(196, 164, 90, 0.75);
}

.verse {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 0.82rem;
  line-height: 1.75;
  letter-spacing: 0.08em;
  color: rgba(233, 228, 214, 0.92);
}

.lyric-line.active .verse {
  color: #ebdaa8;
}

.latin {
  margin: 0.2rem 0 0;
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: rgba(110, 154, 156, 0.7);
}

.note {
  margin: 0.35rem 0 0;
  font-size: 0.68rem;
  line-height: 1.65;
  letter-spacing: 0.04em;
  color: rgba(201, 194, 176, 0.62);
}

.line-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
  margin-top: 0.4rem;
}

.tag {
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  padding: 0.08rem 0.28rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  border-radius: 0.18rem;
  color: rgba(110, 154, 156, 0.75);
}

.lyrics-foot {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.35rem 0.75rem;
  padding: 0.45rem 0.7rem 0.55rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
  font-size: 0.52rem;
  letter-spacing: 0.06em;
  color: rgba(201, 194, 176, 0.4);
}

.foot-future {
  color: rgba(110, 154, 156, 0.55);
}

@media (max-width: 900px) {
  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(14rem, 42vh) minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .mobile-pane-tabs {
    display: flex;
    position: relative;
    z-index: 2;
    flex: 0 0 auto;
    gap: 0.35rem;
    padding:
      0.15rem
      calc(0.75rem + var(--safe-right))
      0.35rem
      calc(0.75rem + var(--safe-left));
  }

  .pane-tab {
    appearance: none;
    flex: 1 1 0;
    min-height: var(--tap-min);
    border: 1px solid rgba(90, 138, 140, 0.28);
    background: rgba(14, 22, 32, 0.55);
    color: rgba(201, 194, 176, 0.62);
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    cursor: pointer;
    transition: color 0.18s, border-color 0.18s, background 0.18s;
  }

  .pane-tab.active {
    color: var(--dan-jin, #c4a45a);
    border-color: rgba(184, 150, 74, 0.5);
    background: rgba(184, 150, 74, 0.1);
  }

  .split-layout.is-mobile {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr);
    gap: 0;
    padding:
      0.2rem
      calc(0.65rem + var(--safe-right))
      calc(0.4rem + var(--app-footer-h))
      calc(0.65rem + var(--safe-left));
  }

  .split-layout.is-mobile .sky-panel,
  .split-layout.is-mobile .lyrics-panel {
    grid-area: 1 / 1;
    min-height: 0;
    height: 100%;
  }

  /* 叠层切换：保星空画布尺寸，勿 display:none */
  .split-layout.is-mobile.pane-sky .lyrics-panel,
  .split-layout.is-mobile.pane-lyrics .sky-panel {
    visibility: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .split-layout.is-mobile.pane-sky .sky-panel,
  .split-layout.is-mobile.pane-lyrics .lyrics-panel {
    visibility: visible;
    pointer-events: auto;
    z-index: 1;
  }

  .nav-btn {
    width: var(--tap-min);
    height: var(--tap-min);
    font-size: 1.1rem;
  }

  .lyric-line {
    min-height: var(--tap-min);
    padding: 0.65rem 0.7rem;
  }

  .lyrics-head {
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .sky-caption {
    left: 0.45rem;
    right: 0.45rem;
    bottom: 0.45rem;
    max-width: none;
  }
}

@media (max-width: 720px) and (orientation: landscape) {
  .split-layout.is-mobile {
    padding-bottom: calc(0.3rem + var(--app-footer-h));
  }
}
</style>
