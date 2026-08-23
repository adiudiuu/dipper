<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import { getTimelineEntries, timelineStats } from '../lib/astronomerTimeline.js'

const entries = getTimelineEntries()
const stats = timelineStats()
const expandedId = ref(null)

const expandedEntry = computed(() =>
  entries.find((e) => e.id === expandedId.value) ?? null
)

function toggleEntry(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function stepEntry(delta) {
  const idx = entries.findIndex((e) => e.id === expandedId.value)
  if (idx < 0) {
    if (entries.length) expandedId.value = entries[0].id
    return
  }
  const next = (idx + delta + entries.length) % entries.length
  expandedId.value = entries[next].id
}
</script>

<template>
  <div class="timeline-page">
    <SpaceBackdrop />

    <header class="page-head">
      <RouterLink to="/" class="back-link" title="返回历象主页">← 七政</RouterLink>
      <div class="head-center">
        <h1 class="page-title">天文史时间线</h1>
        <p class="page-sub">历代历算名家 · 实测改历 · 教学科普</p>
      </div>
      <RouterLink to="/butiange" class="side-link" title="步天歌互动认星">步天歌</RouterLink>
    </header>

    <main class="timeline-main">
      <aside class="intro-panel glass-panel" aria-label="时间线简介">
        <p class="intro-text">
          自西汉《太初历》至元《授时历》、明末《崇祯历书》，中国天文历算以<strong>实测</strong>修正、以<strong>仪器</strong>观象、以<strong>常数</strong>推步。
          点击节点展开人物生平与主要成就。
        </p>
        <div class="intro-meta">
          <span class="meta-chip">共 {{ stats.count }} 位</span>
          <span class="meta-chip">约 {{ stats.span }}</span>
        </div>
      </aside>

      <section class="timeline-track glass-panel" aria-label="天文学家时间线">
        <ol class="timeline-list">
          <li
            v-for="(entry, index) in entries"
            :key="entry.id"
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

.back-link,
.side-link {
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

.back-link:hover,
.side-link:hover {
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

.timeline-main {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: min(16rem, 32vw) 1fr;
  gap: 0.65rem;
  padding:
    0.35rem
    calc(0.85rem + var(--safe-right))
    calc(0.55rem + var(--safe-bottom))
    calc(0.85rem + var(--safe-left));
}

.intro-panel {
  padding: 0.85rem 0.95rem;
  align-self: start;
}

.intro-text {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.75;
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
  gap: 0.35rem;
  margin-top: 0.75rem;
}

.meta-chip {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  padding: 0.18rem 0.45rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  border-radius: 0.25rem;
  color: rgba(110, 154, 156, 0.85);
}

.timeline-track {
  min-height: 0;
  overflow-y: auto;
  padding: 0.65rem 0.75rem 0.85rem;
  -webkit-overflow-scrolling: touch;
}

.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  display: grid;
  grid-template-columns: 1.35rem 1fr;
  gap: 0.65rem;
  margin-bottom: 0.15rem;
}

.rail {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.15rem;
}

.rail-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  border: 2px solid rgba(110, 154, 156, 0.65);
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
  min-height: 0.5rem;
  margin-top: 0.25rem;
  background: linear-gradient(
    180deg,
    rgba(90, 138, 140, 0.35) 0%,
    rgba(90, 138, 140, 0.12) 100%
  );
}

.node-card {
  border: 1px solid rgba(90, 138, 140, 0.18);
  border-radius: 0.45rem;
  background: rgba(14, 22, 32, 0.45);
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
  gap: 0.45rem 0.65rem;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.65rem 0.75rem;
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
  gap: 0.35rem 0.55rem;
  min-width: 0;
}

.node-name {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  color: rgba(233, 228, 214, 0.92);
}

.timeline-item.expanded .node-name {
  color: #ebdaa8;
}

.node-era {
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: rgba(110, 154, 156, 0.85);
}

.node-dates {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  color: rgba(201, 194, 176, 0.55);
  white-space: nowrap;
}

.node-chevron {
  font-size: 1rem;
  line-height: 1;
  color: rgba(201, 194, 176, 0.45);
  min-width: 1.25rem;
  text-align: center;
}

.node-body {
  padding: 0 0.75rem 0.75rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
}

.node-bio {
  margin: 0.65rem 0 0;
  font-size: 0.72rem;
  line-height: 1.8;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.78);
}

.node-section {
  margin-top: 0.75rem;
}

.section-label {
  margin: 0 0 0.4rem;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  color: rgba(110, 154, 156, 0.88);
  font-weight: 600;
}

.achievement-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.68rem;
  line-height: 1.65;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.68);
}

.achievement-list li + li {
  margin-top: 0.25rem;
}

.calendar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.cal-tag {
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  padding: 0.15rem 0.42rem;
  border: 1px solid rgba(184, 150, 74, 0.28);
  border-radius: 0.25rem;
  color: rgba(196, 164, 90, 0.88);
  background: rgba(184, 150, 74, 0.06);
}

.node-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.85rem;
  padding-top: 0.55rem;
  border-top: 1px dashed rgba(90, 138, 140, 0.14);
}

.nav-btn {
  appearance: none;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(14, 22, 32, 0.55);
  color: rgba(201, 194, 176, 0.72);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  padding: 0.35rem 0.65rem;
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
    0.35rem
    calc(1rem + var(--safe-right))
    calc(0.65rem + var(--safe-bottom))
    calc(1rem + var(--safe-left));
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.42);
}

.foot-active {
  color: rgba(110, 154, 156, 0.65);
}

@media (max-width: 720px) {
  .page-head {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .back-link {
    grid-row: 1;
  }

  .side-link {
    grid-row: 1;
    justify-self: end;
  }

  .head-center {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .timeline-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .intro-panel {
    padding: 0.65rem 0.75rem;
  }

  .node-head {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
  }

  .node-dates {
    grid-column: 1;
    grid-row: 2;
  }

  .node-chevron {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
  }

  .node-bio {
    font-size: 0.74rem;
  }
}

@media (min-width: 900px) {
  .timeline-track {
    max-height: none;
  }
}
</style>
