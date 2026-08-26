<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import { SCIENCE_TOPICS } from '../lib/scienceTopics.js'

const router = useRouter()

const MOBILE_MQ = '(max-width: 720px)'
const isMobileLayout = ref(typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches)
/** 窄屏：目录 | 正文 面板切换 */
const mobilePane = ref('menu')

const activeId = ref(SCIENCE_TOPICS.find((t) => t.ready)?.id || SCIENCE_TOPICS[0].id)
const active = computed(
  () => SCIENCE_TOPICS.find((t) => t.id === activeId.value) || SCIENCE_TOPICS[0]
)
const readyCount = computed(() => SCIENCE_TOPICS.filter((t) => t.ready).length)
const menuStat = computed(() => `${readyCount.value} 篇 · 筹备 ${SCIENCE_TOPICS.length - readyCount.value}`)

function selectTopic(id) {
  activeId.value = id
  if (isMobileLayout.value) mobilePane.value = 'article'
}

function goDemo() {
  router.push('/')
}

let mobileMq
let onMobileMqChange

onMounted(() => {
  mobileMq = window.matchMedia(MOBILE_MQ)
  isMobileLayout.value = mobileMq.matches
  onMobileMqChange = () => {
    isMobileLayout.value = mobileMq.matches
  }
  mobileMq.addEventListener('change', onMobileMqChange)
})

onBeforeUnmount(() => {
  mobileMq?.removeEventListener('change', onMobileMqChange)
})
</script>

<template>
  <div class="science-page">
    <SpaceBackdrop />
    <AppHeader />

    <div
      v-if="isMobileLayout"
      class="mobile-pane-tabs"
      role="tablist"
      aria-label="科普面板"
    >
      <button
        type="button"
        role="tab"
        class="pane-tab"
        :class="{ active: mobilePane === 'menu' }"
        :aria-selected="mobilePane === 'menu'"
        @click="mobilePane = 'menu'"
      >目录</button>
      <button
        type="button"
        role="tab"
        class="pane-tab"
        :class="{ active: mobilePane === 'article' }"
        :aria-selected="mobilePane === 'article'"
        @click="mobilePane = 'article'"
      >正文</button>
    </div>

    <main
      class="split-layout"
      :class="{
        'is-mobile': isMobileLayout,
        'pane-menu': isMobileLayout && mobilePane === 'menu',
        'pane-article': isMobileLayout && mobilePane === 'article'
      }"
    >
      <section class="menu-panel glass-panel" aria-label="科普目录">
        <div class="menu-head">
          <span class="menu-title">观象小课</span>
          <span class="menu-stat">{{ menuStat }}</span>
        </div>
        <div class="menu-scroll">
          <button
            v-for="topic in SCIENCE_TOPICS"
            :key="topic.id"
            type="button"
            class="topic-item"
            :class="{ active: topic.id === activeId }"
            @click="selectTopic(topic.id)"
          >
            <div class="topic-row">
              <span class="topic-title">{{ topic.title }}</span>
              <span v-if="!topic.ready" class="todo-badge" aria-label="正文筹备中">筹备中</span>
            </div>
            <span v-if="topic.subtitle" class="topic-sub">{{ topic.subtitle }}</span>
          </button>
        </div>
        <footer class="menu-foot">教学向科普 · 非占卜</footer>
      </section>

      <section class="article-panel glass-panel" aria-label="科普正文">
        <template v-if="active.ready">
          <article class="article-body">
            <header class="article-head">
              <h2 class="article-title">{{ active.title }}</h2>
              <p v-if="active.subtitle" class="article-sub">{{ active.subtitle }}</p>
            </header>

            <section
              v-for="(sec, i) in active.sections"
              :key="i"
              class="article-section"
            >
              <h3 v-if="sec.heading" class="article-section-title">{{ sec.heading }}</h3>
              <p v-for="(para, j) in (sec.paragraphs || [])" :key="j" class="article-p">
                {{ para }}
              </p>
              <dl v-if="sec.facts" class="article-facts">
                <div v-for="(fact, k) in sec.facts" :key="k" class="fact-row">
                  <dt class="fact-name">{{ fact.name }}</dt>
                  <dd class="fact-desc">{{ fact.desc }}</dd>
                </div>
              </dl>
            </section>

            <footer v-if="active.demo" class="article-foot">
              <button type="button" class="demo-btn" @click="goDemo">去历象页演示</button>
              <span class="foot-note">历象页「岁差」滑杆：公元前 2000 − 公元 2100</span>
            </footer>
          </article>
        </template>

        <div v-else class="todo-panel">
          <p class="todo-title">{{ active.title }}</p>
          <p class="todo-text">正文筹备中，敬请期待。</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.science-page {
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
  grid-template-columns: minmax(15rem, 0.62fr) minmax(0, 1.38fr);
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

/* —— 左：目录（菜单） —— */
.menu-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 0.55rem;
  overflow: hidden;
}

.menu-head {
  flex: 0 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.7rem 0.5rem;
  border-bottom: 1px solid rgba(90, 138, 140, 0.16);
}

.menu-title {
  font-family: var(--font-serif);
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  color: rgba(110, 154, 156, 0.9);
}

.menu-stat {
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.45);
}

.menu-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0.55rem 0.6rem 0.7rem;
  -webkit-overflow-scrolling: touch;
}

.topic-item {
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

.topic-item:hover {
  background: rgba(90, 138, 140, 0.06);
}

.topic-item.active {
  border-color: rgba(184, 150, 74, 0.38);
  background: rgba(184, 150, 74, 0.08);
}

.topic-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.topic-title {
  font-family: var(--font-serif);
  font-size: 0.82rem;
  line-height: 1.5;
  letter-spacing: 0.08em;
  color: rgba(233, 228, 214, 0.9);
}

.topic-item.active .topic-title {
  color: #ebdaa8;
}

.todo-badge {
  flex: 0 0 auto;
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  padding: 0.1rem 0.32rem;
  border: 1px solid rgba(90, 138, 140, 0.2);
  border-radius: 0.2rem;
  color: rgba(201, 194, 176, 0.45);
}

.topic-sub {
  display: block;
  margin-top: 0.22rem;
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: rgba(201, 194, 176, 0.5);
}

.menu-foot {
  flex: 0 0 auto;
  padding: 0.4rem 0.7rem 0.5rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
  font-size: 0.52rem;
  letter-spacing: 0.06em;
  color: rgba(201, 194, 176, 0.4);
}

/* —— 右：正文 —— */
.article-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 0.55rem;
  overflow: hidden;
}

.article-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.1rem 1.2rem;
  -webkit-overflow-scrolling: touch;
}

.article-head {
  margin-bottom: 0.9rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid rgba(90, 138, 140, 0.16);
}

.article-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.12rem;
  line-height: 1.5;
  letter-spacing: 0.16em;
  color: #ebdaa8;
}

.article-sub {
  margin: 0.35rem 0 0;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  color: rgba(110, 154, 156, 0.85);
}

.article-section {
  margin-bottom: 1.05rem;
}

.article-section-title {
  margin: 0 0 0.5rem;
  font-family: var(--font-serif);
  font-size: 0.9rem;
  letter-spacing: 0.14em;
  color: rgba(160, 208, 196, 0.9);
}

.article-p {
  margin: 0 0 0.55rem;
  font-size: 0.86rem;
  line-height: 1.85;
  letter-spacing: 0.03em;
  color: rgba(216, 210, 196, 0.88);
  max-width: 40rem;
}

.article-facts {
  margin: 0.1rem 0 0;
}

.fact-row {
  display: grid;
  grid-template-columns: 5.6rem 1fr;
  gap: 0.65rem;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
}

.fact-name {
  font-family: var(--font-serif);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: rgba(233, 228, 214, 0.85);
}

.fact-desc {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.75;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.72);
}

.article-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem 0.8rem;
  margin-top: 0.6rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(90, 138, 140, 0.16);
}

.demo-btn {
  appearance: none;
  min-height: var(--tap-min);
  padding: 0.4rem 0.95rem;
  border: 1px solid rgba(184, 150, 74, 0.45);
  border-radius: 0.32rem;
  background: rgba(184, 150, 74, 0.1);
  color: var(--dan-jin);
  font-family: var(--font-sans);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}

.demo-btn:hover {
  border-color: rgba(184, 150, 74, 0.65);
  background: rgba(184, 150, 74, 0.16);
}

.foot-note {
  font-size: 0.56rem;
  letter-spacing: 0.06em;
  color: rgba(201, 194, 176, 0.45);
}

.todo-panel {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.todo-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 0.9rem;
  letter-spacing: 0.14em;
  color: rgba(233, 228, 214, 0.8);
}

.todo-text {
  margin: 0;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.5);
}

@media (max-width: 900px) {
  .split-layout {
    grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 1.2fr);
  }

  .fact-row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
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

  .split-layout,
  .split-layout.is-mobile {
    display: grid;
    grid-template-columns: 1fr !important;
    grid-template-rows: minmax(0, 1fr) !important;
    gap: 0;
    padding:
      0.2rem
      calc(0.65rem + var(--safe-right))
      calc(0.4rem + var(--app-footer-h))
      calc(0.65rem + var(--safe-left));
  }

  .split-layout .menu-panel,
  .split-layout .article-panel,
  .split-layout.is-mobile .menu-panel,
  .split-layout.is-mobile .article-panel {
    grid-area: 1 / 1;
    min-height: 0;
    height: 100%;
  }

  .split-layout:not(.is-mobile) .article-panel,
  .split-layout.is-mobile.pane-menu .article-panel,
  .split-layout.is-mobile.pane-article .menu-panel {
    visibility: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .split-layout:not(.is-mobile) .menu-panel,
  .split-layout.is-mobile.pane-menu .menu-panel,
  .split-layout.is-mobile.pane-article .article-panel {
    visibility: visible;
    pointer-events: auto;
    z-index: 1;
  }

  .topic-item {
    min-height: var(--tap-min);
    padding: 0.65rem 0.7rem;
  }

  .article-body {
    padding: 0.85rem 0.9rem 1rem;
  }

  .article-title {
    font-size: 1.02rem;
  }
}

@media (max-width: 720px) and (orientation: landscape) {
  .split-layout,
  .split-layout.is-mobile {
    padding-bottom: calc(0.3rem + var(--app-footer-h));
  }
}
</style>