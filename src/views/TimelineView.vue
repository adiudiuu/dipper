<script setup>
import { computed, nextTick, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import {
  getTimelineEntries,
  getTimelineEras,
  timelineStats
} from '../lib/astronomerTimeline.js'

const entries = getTimelineEntries()
const stats = timelineStats()
const eras = getTimelineEras()
const expandedId = ref(null)
const trackRef = ref(null)
const itemRefs = ref({})

const expandedEntry = computed(() =>
  entries.find((e) => e.id === expandedId.value) ?? null
)

const eraGroups = computed(() =>
  eras
    .map((era) => ({
      ...era,
      people: entries.filter((e) => era.match(e.era))
    }))
    .filter((g) => g.people.length > 0)
)

function setItemRef(id, el) {
  if (el) itemRefs.value[id] = el
  else delete itemRefs.value[id]
}

function toggleEntry(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function selectEntry(id) {
  expandedId.value = id
  nextTick(() => {
    itemRefs.value[id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

function jumpEra(eraId) {
  const group = eraGroups.value.find((g) => g.id === eraId)
  const first = group?.people?.[0]
  if (!first) return
  selectEntry(first.id)
}

function stepEntry(delta) {
  const idx = entries.findIndex((e) => e.id === expandedId.value)
  if (idx < 0) {
    if (entries.length) selectEntry(entries[0].id)
    return
  }
  const next = (idx + delta + entries.length) % entries.length
  selectEntry(entries[next].id)
}
</script>

<template>
  <div class="timeline-page">
    <SpaceBackdrop />
    <AppHeader />

    <main class="timeline-main">
      <aside class="intro-panel glass-panel" aria-label="时间线导览">
        <p class="intro-text">
          自先秦星经至清钦天监，中国天文历算以<strong>实测</strong>修正、以<strong>仪器</strong>观象、以<strong>常数</strong>推步。
          点侧栏或节点展开生平与成就。
        </p>
        <div class="intro-meta">
          <span class="meta-chip">共 {{ stats.count }} 位</span>
          <span class="meta-chip">约 {{ stats.span }}</span>
        </div>

        <div class="era-nav" aria-label="时代分期">
          <h3 class="side-label">时代</h3>
          <div class="era-chips">
            <button
              v-for="g in eraGroups"
              :key="g.id"
              type="button"
              class="era-chip"
              @click="jumpEra(g.id)"
            >{{ g.label }} · {{ g.people.length }}</button>
          </div>
        </div>

        <div class="name-roll" aria-label="人物速览">
          <h3 class="side-label">人物</h3>
          <ul class="name-list">
            <li v-for="entry in entries" :key="entry.id">
              <button
                type="button"
                class="name-btn"
                :class="{ active: expandedId === entry.id }"
                @click="selectEntry(entry.id)"
              >
                <span class="name-btn-name">{{ entry.name }}</span>
                <span class="name-btn-era">{{ entry.era }}</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <section
        ref="trackRef"
        class="timeline-track glass-panel"
        aria-label="天文学家时间线"
      >
        <ol class="timeline-list">
          <li
            v-for="(entry, index) in entries"
            :key="entry.id"
            :ref="(el) => setItemRef(entry.id, el)"
            class="timeline-item"
            :class="{ expanded: expandedId === entry.id }"
          >
            <div class="rail">
              <span class="rail-dot" aria-hidden="true" />
              <span v-if="index < entries.length - 1" class="rail-line" aria-hidden="true" />
            </div>

            <article class="node-card">
              <button
                type="button"
                class="node-head"
                :aria-expanded="expandedId === entry.id"
                @click="toggleEntry(entry.id)"
              >
                <div class="node-title-wrap">
                  <h2 class="node-name">{{ entry.name }}</h2>
                  <span class="node-era">{{ entry.era }}</span>
                </div>
                <span class="node-dates">{{ entry.dates }}</span>
                <span class="node-chevron" aria-hidden="true">{{ expandedId === entry.id ? '−' : '+' }}</span>
              </button>

              <div v-show="expandedId === entry.id" class="node-body">
                <p class="node-bio">{{ entry.bio }}</p>

                <div v-if="entry.achievements?.length" class="node-section">
                  <h3 class="section-label">主要成就</h3>
                  <ul class="achievement-list">
                    <li v-for="(item, i) in entry.achievements" :key="i">{{ item }}</li>
                  </ul>
                </div>

                <div v-if="entry.relatedCalendars?.length" class="node-section">
                  <h3 class="section-label">相关历法</h3>
                  <div class="calendar-tags">
                    <span
                      v-for="cal in entry.relatedCalendars"
                      :key="cal"
                      class="cal-tag"
                    >{{ cal }}</span>
                  </div>
                </div>

                <div class="node-nav" role="group" aria-label="浏览相邻人物">
                  <button type="button" class="nav-btn" @click.stop="stepEntry(-1)">‹ 上一位</button>
                  <button type="button" class="nav-btn" @click.stop="stepEntry(1)">下一位 ›</button>
                </div>
              </div>
            </article>
          </li>
        </ol>
      </section>
    </main>

    <footer class="page-foot">
      <span>内容据正史与天文史著述整理 · 非占卜预测</span>
      <span v-if="expandedEntry" class="foot-active">正在阅读：{{ expandedEntry.name }}</span>
    </footer>
  </div>
</template>

<style scoped>
.timeline-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  isolation: isolate;
  color: var(--xuan-zhi-dim, #c9c2b0);
}

.glass-panel {
  border: 1px solid rgba(90, 138, 140, 0.28);
  background: rgba(8, 14, 22, 0.82);
  backdrop-filter: blur(10px);
  border-radius: 0.55rem;
}

.timeline-main {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: min(17.5rem, 34vw) 1fr;
  gap: 0.55rem;
  padding:
    0.3rem
    calc(0.75rem + var(--safe-right))
    calc(0.35rem + var(--safe-bottom))
    calc(0.75rem + var(--safe-left));
}

.intro-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.7rem 0.75rem 0.55rem;
  overflow: hidden;
}

.intro-text {
  margin: 0;
  flex: 0 0 auto;
  font-size: 0.68rem;
  line-height: 1.7;
  letter-spacing: 0.04em;
  color: rgba(201, 194, 176, 0.72);
}

.intro-text strong {
  color: rgba(196, 164, 90, 0.92);
  font-weight: 600;
}

.intro-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  flex: 0 0 auto;
}

.meta-chip {
  font-size: 0.52rem;
  letter-spacing: 0.12em;
  padding: 0.16rem 0.4rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  border-radius: 0.25rem;
  color: rgba(110, 154, 156, 0.85);
}

.side-label {
  margin: 0 0 0.35rem;
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  color: rgba(110, 154, 156, 0.88);
  font-weight: 600;
}

.era-nav {
  flex: 0 0 auto;
}

.era-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
}

.era-chip {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
  color: rgba(201, 194, 176, 0.68);
  font-family: var(--font-sans);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  padding: 0.28rem 0.42rem;
  min-height: 1.85rem;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
}

.era-chip:hover {
  color: var(--dan-jin, #c4a45a);
  border-color: rgba(184, 150, 74, 0.4);
  background: rgba(184, 150, 74, 0.06);
}

.name-roll {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(90, 138, 140, 0.14);
  padding-top: 0.55rem;
}

.name-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.name-btn {
  appearance: none;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.45rem;
  width: 100%;
  border: none;
  border-bottom: 1px solid rgba(90, 138, 140, 0.08);
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0.38rem 0.2rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.name-btn:hover {
  background: rgba(90, 138, 140, 0.08);
}

.name-btn.active {
  background: rgba(184, 150, 74, 0.1);
}

.name-btn-name {
  font-family: var(--font-serif);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  color: rgba(233, 228, 214, 0.88);
}

.name-btn.active .name-btn-name {
  color: #ebdaa8;
}

.name-btn-era {
  flex: 0 0 auto;
  font-size: 0.5rem;
  letter-spacing: 0.06em;
  color: rgba(110, 154, 156, 0.55);
}

.timeline-track {
  min-height: 0;
  overflow-y: auto;
  padding: 0.45rem 0.55rem 0.65rem;
  -webkit-overflow-scrolling: touch;
}

.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  display: grid;
  grid-template-columns: 1.1rem 1fr;
  gap: 0.45rem;
  margin-bottom: 0;
}

.rail {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.85rem;
}

.rail-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  border: 1.5px solid rgba(110, 154, 156, 0.65);
  background: rgba(8, 14, 22, 0.95);
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.timeline-item.expanded .rail-dot {
  border-color: var(--dan-jin, #c4a45a);
  background: rgba(184, 150, 74, 0.25);
  box-shadow: 0 0 0 3px rgba(184, 150, 74, 0.12);
}

.rail-line {
  flex: 1 1 auto;
  width: 1px;
  min-height: 0.35rem;
  margin-top: 0.2rem;
  background: linear-gradient(
    180deg,
    rgba(90, 138, 140, 0.35) 0%,
    rgba(90, 138, 140, 0.12) 100%
  );
}

.node-card {
  border: 1px solid rgba(90, 138, 140, 0.16);
  border-radius: 0.35rem;
  background: rgba(14, 22, 32, 0.42);
  transition: border-color 0.2s, background 0.2s;
}

.timeline-item.expanded .node-card {
  border-color: rgba(184, 150, 74, 0.32);
  background: rgba(184, 150, 74, 0.06);
}

.node-head {
  appearance: none;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.3rem 0.5rem;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.42rem 0.55rem;
  min-height: 2.35rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.node-head:hover {
  background: rgba(90, 138, 140, 0.05);
}

.node-title-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.45rem;
  min-width: 0;
}

.node-name {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 0.86rem;
  letter-spacing: 0.16em;
  color: rgba(233, 228, 214, 0.92);
}

.timeline-item.expanded .node-name {
  color: #ebdaa8;
}

.node-era {
  font-size: 0.52rem;
  letter-spacing: 0.12em;
  color: rgba(110, 154, 156, 0.85);
}

.node-dates {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.04em;
  color: rgba(201, 194, 176, 0.55);
  white-space: nowrap;
}

.node-chevron {
  font-size: 0.92rem;
  line-height: 1;
  color: rgba(201, 194, 176, 0.45);
  min-width: 1.1rem;
  text-align: center;
}

.node-body {
  padding: 0 0.55rem 0.55rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
}

.node-bio {
  margin: 0.5rem 0 0;
  font-size: 0.7rem;
  line-height: 1.75;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.78);
}

.node-section {
  margin-top: 0.55rem;
}

.section-label {
  margin: 0 0 0.32rem;
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  color: rgba(110, 154, 156, 0.88);
  font-weight: 600;
}

.achievement-list {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.66rem;
  line-height: 1.6;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.68);
}

.achievement-list li + li {
  margin-top: 0.18rem;
}

.calendar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
}

.cal-tag {
  font-size: 0.52rem;
  letter-spacing: 0.1em;
  padding: 0.12rem 0.38rem;
  border: 1px solid rgba(184, 150, 74, 0.28);
  border-radius: 0.25rem;
  color: rgba(196, 164, 90, 0.88);
  background: rgba(184, 150, 74, 0.06);
}

.node-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.65rem;
  padding-top: 0.45rem;
  border-top: 1px dashed rgba(90, 138, 140, 0.14);
}

.nav-btn {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
  color: rgba(201, 194, 176, 0.72);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  padding: 0.32rem 0.55rem;
  min-height: var(--tap-min, 2.75rem);
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
}

.nav-btn:hover {
  color: var(--dan-jin, #c4a45a);
  border-color: rgba(184, 150, 74, 0.4);
}

.page-foot {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.35rem;
  padding:
    0.28rem
    calc(1rem + var(--safe-right))
    calc(0.4rem + var(--app-footer-h, 2.4rem))
    calc(1rem + var(--safe-left));
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.42);
}

.foot-active {
  color: rgba(110, 154, 156, 0.65);
}

@media (max-width: 720px) {
  .timeline-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0.45rem;
    padding:
      0.2rem
      calc(0.55rem + var(--safe-right))
      0.2rem
      calc(0.55rem + var(--safe-left));
  }

  .intro-panel {
    max-height: none;
    padding: 0.55rem 0.6rem 0.45rem;
    gap: 0.45rem;
    overflow: visible;
  }

  .intro-text {
    font-size: 0.64rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .era-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 0.1rem;
  }

  .era-chips::-webkit-scrollbar {
    display: none;
  }

  .era-chip {
    flex: 0 0 auto;
    min-height: var(--tap-min, 2.75rem);
    padding: 0.35rem 0.65rem;
    font-size: 0.6rem;
  }

  .name-roll {
    flex: 0 0 auto;
    min-height: 0;
    border-top: 1px solid rgba(90, 138, 140, 0.14);
    padding-top: 0.4rem;
  }

  .name-list {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0.35rem;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    max-height: none;
    padding-bottom: 0.15rem;
  }

  .name-list::-webkit-scrollbar {
    display: none;
  }

  .name-list li {
    flex: 0 0 auto;
  }

  .name-btn {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.12rem;
    min-width: 4.6rem;
    min-height: var(--tap-min, 2.75rem);
    padding: 0.4rem 0.55rem;
    border: 1px solid rgba(90, 138, 140, 0.18);
    border-bottom: 1px solid rgba(90, 138, 140, 0.18);
    border-radius: 0.35rem;
    background: rgba(14, 22, 32, 0.45);
  }

  .name-btn.active {
    border-color: rgba(184, 150, 74, 0.45);
  }

  .name-btn-name {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
  }

  .timeline-track {
    min-height: 0;
    padding: 0.4rem 0.45rem 0.5rem;
  }

  .node-head {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    min-height: var(--tap-min, 2.75rem);
    padding: 0.55rem 0.6rem;
  }

  .node-dates {
    grid-column: 1;
    grid-row: 2;
  }

  .node-chevron {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    min-width: var(--tap-min, 2.75rem);
    min-height: var(--tap-min, 2.75rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .node-bio {
    font-size: 0.72rem;
  }

  .page-foot {
    padding:
      0.22rem
      calc(0.7rem + var(--safe-right))
      calc(0.35rem + var(--app-footer-h, 2.4rem))
      calc(0.7rem + var(--safe-left));
  }
}

@media (max-width: 720px) and (orientation: landscape) {
  .timeline-main {
    grid-template-columns: min(12rem, 38vw) 1fr;
    grid-template-rows: minmax(0, 1fr);
  }

  .intro-text {
    -webkit-line-clamp: 3;
  }

  .name-list {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: min(40vh, 12rem);
  }

  .name-btn {
    flex-direction: row;
    align-items: baseline;
    width: 100%;
    min-width: 0;
  }
}
</style>
