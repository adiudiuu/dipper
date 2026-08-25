<script setup>
import { computed, ref } from 'vue'
import { getCelestialEventsForList } from '../../lib/celestialEvents.js'

const props = defineProps({
  y: { type: Number, required: true },
  m: { type: Number, required: true },
  d: { type: Number, required: true }
})

const emit = defineEmits(['jump', 'panel-wheel'])

const listEl = ref(null)

const events = computed(() => getCelestialEventsForList(props.y, props.m, props.d))

function eventKey(ev) {
  return ev.id || `${ev.y}-${ev.m}-${ev.d}:${ev.name}`
}

function goEvent(ev) {
  emit('jump', { y: ev.y, m: ev.m, d: ev.d })
}

function scrollIntoView() {
  listEl.value?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
}

defineExpose({ scrollIntoView })
</script>

<template>
  <section ref="listEl" class="celestial-block">
    <div class="sec-head">
      <div class="sec-label">近期天象</div>
      <p class="sec-note">教学示意日期，非精确预报</p>
    </div>
    <ul
      class="celestial-list"
      aria-label="近期天象列表"
      @wheel="emit('panel-wheel', $event)"
    >
      <li
        v-for="ev in events"
        :key="eventKey(ev)"
        class="celestial-row"
        :class="{ current: ev.daysLater === 0, past: ev.daysLater < 0 }"
        @click="goEvent(ev)"
      >
        <span class="celestial-icon" aria-hidden="true">{{ ev.icon }}</span>
        <span class="celestial-main">
          <span class="celestial-name-row">
            <span class="celestial-name">{{ ev.name }}</span>
            <span class="celestial-kind" :data-kind="ev.kind">{{ ev.typeLabel }}</span>
            <span
              v-if="ev.precisionLevel === 'high'"
              class="celestial-hint-badge"
              title="教学近似，非精确预报"
            >教学近似</span>
          </span>
          <span class="celestial-desc">{{ ev.description }}</span>
          <span
            v-if="ev.precisionLevel === 'high' && ev.precisionNote"
            class="celestial-precision"
          >{{ ev.precisionNote }}</span>
        </span>
        <span class="celestial-side">
          <span class="celestial-date" title="公历（北京时间示意日）">{{ ev.dateText }}</span>
          <span v-if="ev.daysLater === 0" class="celestial-eta is-day">就是这一天</span>
          <span v-else-if="ev.daysLater > 0" class="celestial-eta">还有 <em>{{ ev.daysLater }}</em> 天</span>
          <span v-else class="celestial-eta is-past">已发生</span>
        </span>
      </li>
    </ul>
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

.sec-head {
  flex: 0 0 auto;
}

.sec-note {
  margin: 0.08rem 0 0;
  font-size: 0.48rem;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  line-height: 1.45;
}

.celestial-block {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  margin-top: 0.55rem;
  padding-top: 0.52rem;
  border-top: 1px solid var(--rule);
  overflow: hidden;
  background: transparent;
}

.celestial-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  margin-top: 0.22rem;
  max-height: min(14rem, 38vh);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding-right: 0.12rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(160, 190, 195, 0.35) transparent;
}

.celestial-list::-webkit-scrollbar {
  width: 3px;
}

.celestial-list::-webkit-scrollbar-thumb {
  background: rgba(160, 190, 195, 0.35);
  border-radius: 999px;
}

.celestial-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  column-gap: 0.42rem;
  padding: 0.42rem 0.08rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(90, 138, 140, 0.1);
  transition: background 0.15s;
}

.celestial-row:last-child {
  border-bottom: none;
}

.celestial-row:hover {
  background: rgba(90, 138, 140, 0.08);
}

.celestial-row.current {
  background: rgba(184, 150, 74, 0.06);
}

.celestial-row.past .celestial-name {
  color: var(--ink-dim);
}

.celestial-icon {
  flex: 0 0 auto;
  font-size: 0.82rem;
  line-height: 1.35;
  opacity: 0.88;
  padding-top: 0.05rem;
}

.celestial-main {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.celestial-name-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.28rem;
  min-width: 0;
}

.celestial-name {
  font-family: var(--font-sans);
  font-size: var(--body-size);
  letter-spacing: 0.1em;
  color: var(--ink-soft);
  text-shadow: var(--text-glow);
}

.celestial-row.current .celestial-name {
  color: var(--jin-soft);
}

.celestial-kind {
  flex: 0 0 auto;
  font-size: 0.48rem;
  letter-spacing: 0.1em;
  color: var(--qing-faint);
  border: 1px solid rgba(110, 154, 156, 0.22);
  padding: 0.02rem 0.2rem;
  line-height: 1.35;
}

.celestial-kind[data-kind='lunar_eclipse'],
.celestial-kind[data-kind='solar_eclipse'] {
  color: rgba(196, 140, 90, 0.75);
  border-color: rgba(196, 140, 90, 0.28);
}

.celestial-hint-badge {
  flex: 0 0 auto;
  font-size: 0.44rem;
  letter-spacing: 0.08em;
  color: rgba(196, 140, 90, 0.82);
  border: 1px solid rgba(196, 140, 90, 0.32);
  padding: 0.02rem 0.18rem;
  line-height: 1.35;
}

.celestial-desc {
  font-size: 0.52rem;
  letter-spacing: 0.04em;
  color: var(--ink-dim);
  line-height: 1.45;
}

.celestial-precision {
  font-size: 0.48rem;
  letter-spacing: 0.04em;
  color: rgba(196, 140, 90, 0.62);
  line-height: 1.4;
}

.celestial-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.05rem;
  font-family: var(--font-mono);
  line-height: 1.25;
  padding-top: 0.02rem;
}

.celestial-date {
  font-size: 0.56rem;
  color: var(--qing-mute);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.celestial-eta {
  font-size: 0.52rem;
  color: var(--ink-faint);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.celestial-eta em {
  font-style: normal;
  color: var(--jin-mute);
  font-weight: 500;
}

.celestial-eta.is-day {
  color: var(--jin-mute);
}

.celestial-eta.is-past {
  color: var(--qing-faint);
}

@media (max-width: 720px) {
  .celestial-list {
    max-height: min(16rem, 42vh);
  }

  .celestial-row {
    min-height: var(--tap-min);
    padding: 0.5rem 0.08rem;
  }
}
</style>
