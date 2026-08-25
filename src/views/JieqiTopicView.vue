<script setup>
import { computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import SpaceBackdrop from '../components/SpaceBackdrop.vue'
import { JIEQI } from '../lib/calendar.js'
import {
  getAllJieqiTopics,
  getJieqiTopicBySlug,
  getJieqiTopicSlug
} from '../data/jieqiTopics.js'

const route = useRoute()
const router = useRouter()

const topic = computed(() => getJieqiTopicBySlug(String(route.params.slug || '')))
const allTopics = getAllJieqiTopics()

const DEFAULT_TOPIC_DESC =
  '二十四节气授时、历法与认星教学科普，非占卜预测。'

function setMetaDescription(content) {
  let el = document.querySelector('meta[name="description"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'description')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

watch(
  topic,
  (t) => {
    if (t) {
      document.title = `七政 · ${t.term} · ${t.title}`
      setMetaDescription(t.summary)
      return
    }
    document.title = '七政 · 节气专题'
    setMetaDescription(DEFAULT_TOPIC_DESC)
  },
  { immediate: true }
)

const neighborTerms = computed(() => {
  if (!topic.value) return { prev: null, next: null }
  const idx = JIEQI.findIndex((j) => j.name === topic.value.term)
  if (idx < 0) return { prev: null, next: null }
  const prevName = JIEQI[(idx - 1 + JIEQI.length) % JIEQI.length].name
  const nextName = JIEQI[(idx + 1) % JIEQI.length].name
  return {
    prev: { name: prevName, slug: getJieqiTopicSlug(prevName) },
    next: { name: nextName, slug: getJieqiTopicSlug(nextName) }
  }
})

function goSlug(slug) {
  if (!slug) return
  router.push({ name: 'jieqi-topic', params: { slug } })
}
</script>

<template>
  <div class="topic-page">
    <SpaceBackdrop />
    <AppHeader />

    <main class="topic-main">
      <aside class="topic-nav glass-panel" aria-label="节气专题导航">
        <RouterLink to="/" class="back-link">‹ 返回历象</RouterLink>
        <h2 class="nav-title">节气专题</h2>
        <p class="nav-hint">授时 · 历法 · 认星教学，非占卜预测</p>
        <ul class="term-list">
          <li v-for="item in allTopics" :key="item.slug">
            <button
              type="button"
              class="term-btn"
              :class="{ active: topic?.slug === item.slug, ready: item.ready }"
              @click="goSlug(item.slug)"
            >
              <span class="term-btn-name">{{ item.term }}</span>
              <span class="term-btn-tag">{{ item.ready ? '已发布' : '待补充' }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <article v-if="topic" class="topic-article glass-panel" aria-label="节气科普短文">
        <header class="article-head">
          <span class="article-badge">{{ topic.term }} · 节气科普</span>
          <h1 class="article-title">{{ topic.title }}</h1>
          <p class="article-summary">{{ topic.summary }}</p>
        </header>

        <div class="article-body">
          <section
            v-for="(sec, i) in topic.sections"
            :key="i"
            class="article-section"
          >
            <h2 v-if="sec.heading" class="section-heading">{{ sec.heading }}</h2>
            <p class="section-text">{{ sec.body }}</p>
          </section>
        </div>

        <footer class="article-foot">
          <div class="foot-nav" role="group" aria-label="相邻节气">
            <button
              v-if="neighborTerms.prev?.slug"
              type="button"
              class="foot-btn"
              @click="goSlug(neighborTerms.prev.slug)"
            >‹ {{ neighborTerms.prev.name }}</button>
            <button
              v-if="neighborTerms.next?.slug"
              type="button"
              class="foot-btn"
              @click="goSlug(neighborTerms.next.slug)"
            >{{ neighborTerms.next.name }} ›</button>
          </div>
          <span class="foot-note">内容据天文历算常识整理 · 非占卜预测</span>
        </footer>
      </article>

      <section v-else class="topic-missing glass-panel" aria-label="未找到专题">
        <p>未找到该节气专题。</p>
        <RouterLink to="/" class="back-link">返回历象</RouterLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
.topic-page {
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

.topic-main {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: min(14.5rem, 32vw) 1fr;
  gap: 0.55rem;
  padding:
    0.3rem
    calc(0.75rem + var(--safe-right))
    calc(0.55rem + var(--app-footer-h))
    calc(0.75rem + var(--safe-left));
}

.back-link {
  display: inline-block;
  margin-bottom: 0.55rem;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: rgba(110, 154, 156, 0.85);
  text-decoration: none;
  transition: color 0.18s;
}

.back-link:hover {
  color: var(--dan-jin, #c4a45a);
}

.topic-nav {
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0.65rem 0.6rem 0.5rem;
  overflow: hidden;
}

.nav-title {
  margin: 0 0 0.25rem;
  font-family: var(--font-serif);
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  color: rgba(233, 228, 214, 0.9);
}

.nav-hint {
  margin: 0 0 0.55rem;
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.45);
  line-height: 1.5;
}

.term-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.term-btn {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  width: 100%;
  border: none;
  border-bottom: 1px solid rgba(90, 138, 140, 0.08);
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0.36rem 0.15rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.term-btn:hover {
  background: rgba(90, 138, 140, 0.08);
}

.term-btn.active {
  background: rgba(184, 150, 74, 0.1);
}

.term-btn-name {
  font-family: var(--font-serif);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  color: rgba(233, 228, 214, 0.85);
}

.term-btn.active .term-btn-name {
  color: #ebdaa8;
}

.term-btn-tag {
  flex: 0 0 auto;
  font-size: 0.48rem;
  letter-spacing: 0.08em;
  color: rgba(110, 154, 156, 0.45);
}

.term-btn.ready .term-btn-tag {
  color: rgba(196, 164, 90, 0.65);
}

.topic-article,
.topic-missing {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.article-head {
  flex: 0 0 auto;
  padding: 0.75rem 0.85rem 0.55rem;
  border-bottom: 1px solid rgba(90, 138, 140, 0.14);
}

.article-badge {
  font-size: 0.52rem;
  letter-spacing: 0.16em;
  color: rgba(110, 154, 156, 0.85);
}

.article-title {
  margin: 0.35rem 0 0.45rem;
  font-family: var(--font-serif);
  font-size: 1rem;
  letter-spacing: 0.14em;
  line-height: 1.45;
  color: #ebdaa8;
  font-weight: 600;
}

.article-summary {
  margin: 0;
  font-size: 0.68rem;
  line-height: 1.7;
  letter-spacing: 0.04em;
  color: rgba(201, 194, 176, 0.72);
}

.article-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0.65rem 0.85rem 0.75rem;
  -webkit-overflow-scrolling: touch;
}

.article-section + .article-section {
  margin-top: 0.65rem;
  padding-top: 0.55rem;
  border-top: 1px dashed rgba(90, 138, 140, 0.12);
}

.section-heading {
  margin: 0 0 0.32rem;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  color: rgba(110, 154, 156, 0.9);
  font-weight: 600;
}

.section-text {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.75;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.78);
}

.article-foot {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem 0.65rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
}

.foot-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.foot-btn {
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

.foot-btn:hover {
  color: var(--dan-jin, #c4a45a);
  border-color: rgba(184, 150, 74, 0.4);
}

.foot-note {
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  color: rgba(201, 194, 176, 0.42);
}

.topic-missing {
  padding: 1rem 0.85rem;
  font-size: 0.72rem;
}

@media (max-width: 720px) {
  .topic-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0.45rem;
  }

  .topic-nav {
    max-height: 9.5rem;
  }

  .term-btn {
    min-height: var(--tap-min, 2.75rem);
    padding: 0.45rem 0.2rem;
  }
}
</style>
