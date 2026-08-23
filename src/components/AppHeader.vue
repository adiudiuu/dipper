<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  constellationMode: { type: String, required: true },
  eastLabels: { type: Boolean, required: true },
  dateValue: { type: String, required: true },
  skyModes: { type: Array, required: true }
})

const emit = defineEmits([
  'update:constellationMode',
  'update:eastLabels',
  'update:dateValue',
  'defaults',
  'addDays'
])

const showEastLabelToggle = computed(
  () => props.constellationMode === 'east' || props.constellationMode === 'all'
)
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <img class="brand-logo" src="/logo.svg?v=2" width="36" height="36" alt="" aria-hidden="true">
      <div class="brand-text" title="教学向历象观天，非算命">
        <h1>七政</h1>
        <div class="sub">历象 · 授时 · 节气</div>
      </div>
    </div>
    <div class="actions">
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
        v-if="showEastLabelToggle"
        class="sky-mode sky-mode-labels"
        role="group"
        aria-label="古象贴名"
      >
        <button
          type="button"
          class="sky-mode-btn"
          :class="{ active: eastLabels }"
          :aria-pressed="eastLabels"
          @click="emit('update:eastLabels', true)"
        >显名</button>
        <button
          type="button"
          class="sky-mode-btn"
          :class="{ active: !eastLabels }"
          :aria-pressed="!eastLabels"
          @click="emit('update:eastLabels', false)"
        >隐名</button>
      </div>
      <div class="day-nav" role="group" aria-label="换日">
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
      <RouterLink to="/butiange" class="nav-link" title="步天歌互动认星">步天歌</RouterLink>
      <RouterLink to="/timeline" class="nav-link" title="历代天文历法名家">时间线</RouterLink>
      <button type="button" class="btn" title="恢复全部初始状态" @click="emit('defaults')">默认</button>
      <label class="date-wrap" title="跳转到指定公历日期">
        <input
          :value="dateValue"
          type="date"
          aria-label="选择公历日期"
          @input="emit('update:dateValue', $event.target.value)"
        >
      </label>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
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

.brand {
  display: flex;
  align-items: center;
  gap: 0.72rem;
  min-width: 0;
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

.actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  align-items: center;
  min-height: 2.55rem;
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

@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    padding:
      calc(0.72rem + var(--safe-top))
      calc(0.85rem + var(--safe-right))
      0.55rem
      calc(0.85rem + var(--safe-left));
  }

  .brand h1 {
    font-size: 1.1rem;
  }

  .brand .sub {
    font-size: 0.62rem;
  }

  .actions {
    width: 100%;
    min-height: auto;
    gap: 0.45rem;
  }

  .sky-mode,
  .sky-mode-labels {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .sky-mode::-webkit-scrollbar,
  .sky-mode-labels::-webkit-scrollbar {
    display: none;
  }

  .sky-mode,
  .sky-mode-labels,
  .day-nav {
    min-height: var(--tap-min);
  }

  .sky-mode-btn,
  .day-nav-btn,
  .btn,
  .nav-link {
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    height: auto;
  }

  .sky-mode-btn {
    flex: 0 0 auto;
    white-space: nowrap;
    font-size: 0.68rem;
    padding: 0 0.72rem;
  }

  .day-nav {
    display: inline-flex;
  }

  .date-wrap {
    flex: 1 1 auto;
    min-width: 0;
  }

  .date-wrap input[type='date'] {
    width: 100%;
    min-height: var(--tap-min);
    height: auto;
    font-size: 0.78rem;
  }
}

@media (max-width: 400px) {
  .brand .sub {
    display: none;
  }

  .sky-mode-labels {
    display: none;
  }

  .btn {
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    padding: 0.38rem 0.55rem;
  }
}
</style>
