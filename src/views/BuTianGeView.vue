<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import BuTianSkyScene from '../components/BuTianSkyScene.vue'
import CultureCard from '../components/CultureCard.vue'
import {
  BU_TIAN_GE_LINES,
  BU_TIAN_GE_SECTIONS,
  buTianGeStats,
  getConstellationsForLine
} from '../lib/buTianGe.js'

const activeIndex = ref(0)
const lyricsRef = ref(null)
const lineRefs = ref([])
const showLabels = ref(true)
const cultureOpen = ref(false)
const cultureName = ref('')
const cultureData = ref(null)
const scrollSyncLock = ref(false)

const stats = buTianGeStats()

const activeLine = computed(() => BU_TIAN_GE_LINES[activeIndex.value] ?? null)
const highlightNames = computed(() =>
  activeLine.value ? getConstellationsForLine(activeLine.value) : []
)

function lineFlatIndex(lineId) {
  return BU_TIAN_GE_LINES.findIndex((l) => l.id === lineId)
}

function setLineRef(el, lineId) {
  if (!el) return
  const idx = lineFlatIndex(lineId)
  if (idx >= 0) lineRefs.value[idx] = el
}

function selectLine(flatIndex, scrollIntoView = true) {
  if (flatIndex < 0 || flatIndex >= BU_TIAN_GE_LINES.length) return
  activeIndex.value = flatIndex
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

function stepLine(delta) {
  selectLine(activeIndex.value + delta)
}

function onCultureOpen(payload) {
  cultureName.value = payload.name
  cultureData.value = payload.culture
  cultureOpen.value = true
}

function closeCulture() {
  cultureOpen.value = false
}

let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (scrollSyncLock.value) return
      const visible = entries
        .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.55)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (!visible.length) return
      const idx = Number(visible[0].target.dataset.index)
      if (!Number.isNaN(idx) && idx !== activeIndex.value) {
        activeIndex.value = idx
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
  observer?.disconnect()
})
</script>

<template>
  <div class="butiange-page">
    <SpaceBackdrop />
    <header class="page-head">
      <RouterLink to="/" class="back-link" title="返回历象主页">← 七政</RouterLink>
      <div class="head-center">
        <h1 class="page-title">步天歌</h1>
        <p class="page-sub">按歌诀认星 · 三垣二十八宿 · 教学科普</p>
      </div>
      <div class="head-actions">
        <button
          type="button"
          class="glass-btn"
          :class="{ active: showLabels }"
          :aria-pressed="showLabels"
          @click="showLabels = !showLabels"
        >
          {{ showLabels ? '隐名' : '显名' }}
        </button>
      </div>
    </header>

    <main class="split-layout">
      <section class="sky-panel glass-panel" aria-label="古象星空">
        <BuTianSkyScene
          :highlight-names="highlightNames"
          :show-labels="showLabels"
          @constellation-click="onCultureOpen"
        />
        <div v-if="activeLine" class="sky-caption glass-caption">
          <span class="cap-badge">{{ activeLine.sectionTitle }}</span>
          <span class="cap-names">{{ highlightNames.join(' · ') }}</span>
        </div>
      </section>

      <section class="lyrics-panel glass-panel" aria-label="步天歌歌诀">
        <div class="lyrics-head">
          <span class="lyrics-stat">共 {{ stats.lines }} 句 · {{ stats.constellations }} 官</span>
          <div class="line-nav" role="group" aria-label="逐句浏览">
            <button type="button" class="nav-btn" aria-label="上一句" @click="stepLine(-1)">‹</button>
            <span class="nav-pos">{{ activeIndex + 1 }} / {{ stats.lines }}</span>
            <button type="button" class="nav-btn" aria-label="下一句" @click="stepLine(1)">›</button>
          </div>
        </div>

        <div ref="lyricsRef" class="lyrics-scroll">
          <article
            v-for="section in BU_TIAN_GE_SECTIONS"
            :key="section.id"
            class="lyrics-section"
          >
            <header class="section-head">
              <h2 class="section-title">{{ section.title }}</h2>
              <span v-if="section.subtitle" class="section-sub">{{ section.subtitle }}</span>
            </header>
            <button
              v-for="line in section.lines"
              :key="line.id"
              :ref="(el) => setLineRef(el, line.id)"
              type="button"
              class="lyric-line"
              :class="{ active: lineFlatIndex(line.id) === activeIndex }"
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
        </div>

        <footer class="lyrics-foot">
          <span>歌诀据明王希明《步天歌》节录 · 非占卜预测</span>
          <span class="foot-future">朗读（TTS）规划中</span>
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

.page-head {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding:
    calc(0.75rem + var(--safe-top))
    calc(1rem + var(--safe-right))
    0.55rem
    calc(1rem + var(--safe-left));
  background: linear-gradient(
    180deg,
    rgba(8, 14, 22, 0.9) 0%,
    rgba(8, 14, 22, 0.35) 70%,
    transparent 100%
  );
}

.back-link {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: rgba(201, 194, 176, 0.72);
  text-decoration: none;
  padding: 0.35rem 0.55rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  border-radius: 0.35rem;
  transition: color 0.18s, border-color 0.18s;
  white-space: nowrap;
}

.back-link:hover {
  color: var(--dan-jin, #c4a45a);
  border-color: rgba(184, 150, 74, 0.45);
}

.head-center {
  min-width: 0;
  text-align: center;
}

.page-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  color: var(--dan-jin, #c4a45a);
}

.page-sub {
  margin: 0.2rem 0 0;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: rgba(201, 194, 176, 0.55);
}

.glass-btn {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(14, 22, 32, 0.72);
  color: rgba(201, 194, 176, 0.72);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  padding: 0.38rem 0.72rem;
  min-height: var(--tap-min, 2.75rem);
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
}

.glass-btn.active,
.glass-btn:hover {
  color: var(--dan-jin, #c4a45a);
  border-color: rgba(184, 150, 74, 0.45);
}

.split-layout {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr min(22rem, 42vw);
  gap: 0.65rem;
  padding:
    0.35rem
    calc(0.85rem + var(--safe-right))
    calc(0.75rem + var(--safe-bottom))
    calc(0.85rem + var(--safe-left));
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
  right: 0.65rem;
  bottom: 0.65rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.65rem;
  padding: 0.45rem 0.65rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(8, 14, 22, 0.72);
  pointer-events: none;
}

.glass-caption {
  backdrop-filter: blur(6px);
}

.cap-badge {
  font-size: 0.52rem;
  letter-spacing: 0.18em;
  color: rgba(110, 154, 156, 0.85);
}

.cap-names {
  font-family: var(--font-serif);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  color: var(--dan-jin, #c4a45a);
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
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid rgba(90, 138, 140, 0.16);
}

.lyrics-stat {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  color: rgba(201, 194, 176, 0.5);
}

.line-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
}

.nav-btn {
  appearance: none;
  border: none;
  background: transparent;
  color: rgba(201, 194, 176, 0.75);
  font-size: 1.1rem;
  line-height: 1;
  min-width: var(--tap-min, 2.75rem);
  min-height: 2rem;
  cursor: pointer;
}

.nav-btn:hover {
  color: var(--dan-jin, #c4a45a);
}

.nav-pos {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  color: rgba(201, 194, 176, 0.62);
  padding: 0 0.25rem;
}

.lyrics-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0.45rem 0.55rem;
  -webkit-overflow-scrolling: touch;
}

.lyrics-section {
  margin-bottom: 0.65rem;
}

.section-head {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  padding: 0.35rem 0.25rem 0.45rem;
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
  gap: 0.3rem;
  margin-top: 0.4rem;
}

.tag {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  padding: 0.12rem 0.38rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  border-radius: 0.25rem;
  color: rgba(110, 154, 156, 0.85);
}

.lyrics-foot {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.45rem 0.75rem 0.6rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.42);
}

.foot-future {
  color: rgba(110, 154, 156, 0.55);
}

@media (max-width: 720px) {
  .page-head {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .back-link {
    grid-row: 1;
  }

  .head-actions {
    grid-row: 1;
    justify-self: end;
  }

  .head-center {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: min(38vh, 16rem) 1fr;
    gap: 0.5rem;
  }

  .verse {
    font-size: 0.78rem;
  }
}
</style>
