<script setup>
import { nextTick, ref, watch } from 'vue'
import {
  FESTIVAL_MAX_SCAN_DAYS,
  getUpcomingFestivals
} from '../../lib/festivals.js'

const props = defineProps({
  y: { type: Number, required: true },
  m: { type: Number, required: true },
  d: { type: Number, required: true }
})

const emit = defineEmits(['jump', 'panel-wheel'])

const FEST_BATCH = 15
const FEST_MAX_ITEMS = 72
const FEST_SCROLL_NEAR = 48

const upcoming = ref([])
const festHasMore = ref(true)
const festLoading = ref(false)
const festScrollEl = ref(null)

function festItemKey(f) {
  return f.key || `${f.y * 10000 + f.m * 100 + f.d}:${f.name}`
}

function loadMoreFestivals(isReset = false) {
  if (festLoading.value) return
  if (!isReset && !festHasMore.value) return
  if (!isReset && upcoming.value.length >= FEST_MAX_ITEMS) {
    festHasMore.value = false
    return
  }

  festLoading.value = true
  try {
    const remain = FEST_MAX_ITEMS - upcoming.value.length
    const limit = Math.min(FEST_BATCH, remain)
    if (limit <= 0) {
      festHasMore.value = false
      return
    }

    const skipKeys = new Set(upcoming.value.map(festItemKey))
    const fromOffset = upcoming.value.length
      ? upcoming.value[upcoming.value.length - 1].daysLater
      : 0

    const batch = getUpcomingFestivals(props.y, props.m, props.d, limit, {
      fromOffset,
      maxOffset: FESTIVAL_MAX_SCAN_DAYS,
      skipKeys
    })

    if (batch.length) upcoming.value = upcoming.value.concat(batch)

    const hitCap = upcoming.value.length >= FEST_MAX_ITEMS
    festHasMore.value = !hitCap && batch.length === limit
  } catch {
    festHasMore.value = false
  } finally {
    festLoading.value = false
  }

  if (isReset || festHasMore.value) {
    nextTick(() => fillFestScrollIfNeeded())
  }
}

function resetUpcoming() {
  upcoming.value = []
  festHasMore.value = true
  festLoading.value = false
  loadMoreFestivals(true)
}

function fillFestScrollIfNeeded() {
  const el = festScrollEl.value
  if (!el || !festHasMore.value || festLoading.value) return
  if (el.scrollHeight <= el.clientHeight + 4) {
    loadMoreFestivals(false)
  }
}

function onFestScroll(e) {
  const el = e.currentTarget
  if (!el || !festHasMore.value || festLoading.value) return
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - FEST_SCROLL_NEAR
  if (nearBottom) loadMoreFestivals(false)
}

watch(
  () => `${props.y}-${props.m}-${props.d}`,
  () => {
    resetUpcoming()
  },
  { immediate: true }
)

function resetScroll() {
  if (festScrollEl.value) festScrollEl.value.scrollTop = 0
}

defineExpose({ resetScroll, resetUpcoming })
</script>

<template>
  <section class="fest-block">
    <div class="sec-label fest-block-label">节日</div>
    <div
      ref="festScrollEl"
      class="fest-scroll"
      tabindex="0"
      aria-label="节日列表"
      @wheel="emit('panel-wheel', $event)"
      @scroll="onFestScroll"
    >
      <ul class="fest-list">
        <li
          v-for="f in upcoming"
          :key="festItemKey(f)"
          class="fest-row"
          :class="{ current: f.daysLater === 0 }"
          @click="emit('jump', f)"
        >
          <span class="fest-main">
            <span class="fest-name-row">
              <span class="fest-name">{{ f.name }}</span>
              <span
                v-if="f.kindLabel"
                class="fest-kind"
                :data-kind="f.kind"
              >{{ f.kindLabel }}</span>
            </span>
            <span v-if="f.lunarText" class="fest-lunar">{{ f.lunarText }}</span>
          </span>
          <span class="fest-side">
            <span class="fest-date" title="公历">{{ f.dateText }}</span>
            <span v-if="f.daysLater === 0" class="fest-eta is-day">就是这一天</span>
            <span v-else class="fest-eta">还有 <em>{{ f.daysLater }}</em> 天</span>
          </span>
        </li>
      </ul>
      <p v-if="!festHasMore && upcoming.length" class="fest-end">没有更多</p>
    </div>
    <div class="panel-notes">
      <p class="tip tip-desktop">左键旋转 · 右键/中键平移 · 滚轮缩放 · Shift 拨日 · ← → 换日 · 顶栏切星象</p>
      <p class="tip tip-mobile">单指旋转 · 双指缩放平移 · 长按后横拖拨日 · 顶栏 ‹ › 换日 · 顶栏切星象</p>
    </div>
  </section>
</template>

<style scoped>
.sec-label {
  font-size: var(--label-size);
  letter-spacing: var(--label-track);
  color: var(--qing-label);
  margin-bottom: 0.1rem;
  font-weight: 400;
}

.fest-block {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 0.55rem;
  padding-top: 0.52rem;
  border-top: 1px solid var(--rule);
  overflow: hidden;
  background: transparent;
}

.fest-block-label {
  flex: 0 0 auto;
}

.fest-scroll {
  position: relative;
  flex: 1 1 0%;
  min-height: 0;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  margin-top: 0.12rem;
  padding-right: 0.12rem;
  background: transparent;
  scrollbar-width: thin;
  scrollbar-color: rgba(160, 190, 195, 0.35) transparent;
  outline: none;
}

.fest-scroll::-webkit-scrollbar {
  width: 3px;
  height: 3px;
  background: transparent;
}

.fest-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.fest-scroll::-webkit-scrollbar-thumb {
  background: rgba(160, 190, 195, 0.35);
  border-radius: 999px;
}

.fest-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(160, 190, 195, 0.5);
}

.fest-scroll::-webkit-scrollbar-corner {
  background: transparent;
}

.fest-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.fest-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 0.55rem;
  padding: 0.38rem 0.08rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(90, 138, 140, 0.1);
  transition: background 0.15s;
  background: transparent;
}

.fest-main {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  min-width: 0;
}

.fest-row:last-child {
  border-bottom: none;
}

.fest-row:hover {
  background: rgba(90, 138, 140, 0.08);
}

.fest-name-row {
  display: flex;
  align-items: baseline;
  gap: 0.28rem;
  min-width: 0;
}

.fest-name {
  font-family: var(--font-sans);
  font-size: var(--body-size);
  letter-spacing: 0.1em;
  color: var(--ink-soft);
  min-width: 0;
  text-shadow: var(--text-glow);
}

.fest-kind {
  flex: 0 0 auto;
  font-size: 0.48rem;
  letter-spacing: 0.1em;
  color: var(--qing-faint);
  border: 1px solid rgba(110, 154, 156, 0.22);
  padding: 0.02rem 0.2rem;
  line-height: 1.35;
}

.fest-kind[data-kind='jieqi'] {
  color: var(--jin-mute);
  border-color: rgba(196, 164, 90, 0.28);
}

.fest-kind[data-kind='lunar'] {
  color: var(--qing-mute);
  border-color: rgba(110, 154, 156, 0.28);
}

.fest-lunar {
  font-family: var(--font-sans);
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: var(--ink-dim);
  text-shadow: var(--text-glow);
  line-height: 1.2;
}

.fest-row.current .fest-name {
  color: var(--jin-soft);
}

.fest-row.current .fest-lunar {
  color: var(--ink-soft);
}

.fest-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.05rem;
  font-family: var(--font-mono);
  line-height: 1.25;
}

.fest-date {
  font-size: 0.56rem;
  color: var(--qing-mute);
  letter-spacing: 0.02em;
  text-shadow: var(--text-glow);
}

.fest-eta {
  font-size: 0.52rem;
  color: var(--ink-faint);
  letter-spacing: 0.02em;
}

.fest-eta em {
  font-style: normal;
  color: var(--jin-mute);
  font-weight: 500;
}

.fest-eta.is-day {
  color: var(--jin-mute);
}

.fest-end {
  margin: 0.35rem 0 0.15rem;
  text-align: center;
  font-size: 0.5rem;
  letter-spacing: 0.14em;
  color: var(--ink-faint);
  text-shadow: none;
}

.panel-notes {
  flex: 0 0 auto;
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(90, 138, 140, 0.1);
  background: transparent;
}

.tip {
  font-size: 0.5rem;
  color: var(--ink-faint);
  letter-spacing: 0.06em;
  line-height: 1.55;
  text-shadow: var(--text-glow);
}

.tip-mobile {
  display: none;
}

@media (max-width: 720px) {
  .tip-desktop {
    display: none;
  }

  .tip-mobile {
    display: block;
  }

  .fest-row {
    min-height: var(--tap-min);
    padding: 0.5rem 0.08rem;
  }
}
</style>
