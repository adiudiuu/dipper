<script setup>
import { ref } from 'vue'
import AlmanacSolar from './almanac/AlmanacSolar.vue'
import AlmanacLunar from './almanac/AlmanacLunar.vue'
import AlmanacJieqi from './almanac/AlmanacJieqi.vue'
import FestivalList from './almanac/FestivalList.vue'

defineProps({
  open: { type: Boolean, required: true },
  solarText: { type: String, required: true },
  lunarMainText: { type: String, required: true },
  isLeapMonth: { type: Boolean, default: false },
  daoYearText: { type: String, required: true },
  suiXing: { type: Object, required: true },
  sizhu: { type: Object, default: null },
  currentTerm: { type: String, required: true },
  termIntoDays: { type: Number, required: true },
  termSub: { type: String, required: true },
  phaseFrac: { type: Number, required: true },
  phaseLabel: { type: String, required: true },
  moonAge: { type: Number, required: true },
  todayFestivals: { type: Array, default: () => [] },
  y: { type: Number, required: true },
  m: { type: Number, required: true },
  d: { type: Number, required: true }
})

const emit = defineEmits(['toggle', 'jump', 'panel-wheel'])

const festivalListRef = ref(null)

function resetFestivals() {
  festivalListRef.value?.resetScroll?.()
  festivalListRef.value?.resetUpcoming?.()
}

defineExpose({ resetFestivals })
</script>

<template>
  <aside
    class="glass-panel lixiang"
    :class="{ collapsed: !open }"
    aria-label="历象"
    @wheel="emit('panel-wheel', $event)"
  >
    <button
      type="button"
      class="lixiang-rail"
      :aria-expanded="open"
      :aria-label="open ? '收起历象' : '展开历象'"
      :title="open ? '收起' : '展开历象'"
      @click="emit('toggle')"
    >
      <span class="rail-mark" aria-hidden="true">{{ open ? '›' : '‹' }}</span>
      <span class="rail-title">历象</span>
    </button>

    <div class="lixiang-shell" :inert="!open || undefined">
      <div class="lixiang-body">
        <div class="lixiang-fixed">
          <AlmanacSolar :solar-text="solarText" />
          <AlmanacLunar
            :lunar-main-text="lunarMainText"
            :is-leap-month="isLeapMonth"
            :dao-year-text="daoYearText"
            :sui-xing="suiXing"
            :sizhu="sizhu"
          />
          <AlmanacJieqi
            :current-term="currentTerm"
            :term-into-days="termIntoDays"
            :term-sub="termSub"
            :phase-frac="phaseFrac"
            :phase-label="phaseLabel"
            :moon-age="moonAge"
            :today-festivals="todayFestivals"
          />
        </div>

        <FestivalList
          ref="festivalListRef"
          :y="y"
          :m="m"
          :d="d"
          @jump="emit('jump', $event)"
          @panel-wheel="emit('panel-wheel', $event)"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* —— 历象玻璃面板色板（叠星空，忌纯白墙字）——
   玄夜半透底 · 石青标签 · 柔宣纸主文 · 淡金节气强调 · 石青灰副文 */
.glass-panel {
  --panel-bg: rgba(8, 14, 22, 0.22);
  --panel-border: rgba(90, 138, 140, 0.22);
  --panel-pad-x: 0.85rem;
  --panel-pad-y: 0.72rem;
  --rule: rgba(90, 138, 140, 0.16);

  --ink: #c9c2b0;
  --ink-soft: rgba(201, 194, 176, 0.78);
  --ink-dim: rgba(201, 194, 176, 0.55);
  --ink-faint: rgba(201, 194, 176, 0.38);

  --qing: #6e9a9c;
  --qing-label: rgba(110, 154, 156, 0.72);
  --qing-mute: rgba(110, 154, 156, 0.55);
  --qing-faint: rgba(110, 154, 156, 0.4);

  --jin: #c4a45a;
  --jin-soft: rgba(196, 164, 90, 0.82);
  --jin-mute: rgba(196, 164, 90, 0.55);

  --label-size: 0.52rem;
  --label-track: 0.22em;
  --solar-size: 0.78rem;
  --lunar-size: 0.9rem;
  --term-name-size: 0.92rem;
  --term-meta-size: 0.62rem;
  --body-size: 0.7rem;
  --mute-size: 0.58rem;
  --mono-size: 0.62rem;

  --text-glow: 0 1px 2px rgba(0, 0, 0, 0.65);

  font-family: var(--font-sans);
  background: transparent;
  border: 1px solid var(--panel-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 20;
  color: var(--ink);
  text-shadow: var(--text-glow);
}

.glass-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: var(--panel-bg);
}

.lixiang {
  --rail-w: 1.55rem;
  --panel-w: min(15.5rem, 46vw);
  position: absolute;
  right: 1.15rem;
  top: 0.8rem;
  bottom: 0.8rem;
  width: calc(var(--rail-w) + var(--panel-w));
  height: auto;
  max-height: none;
  padding: 0;
  pointer-events: auto;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
  z-index: 20;
  transition:
    width 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.32s ease,
    border-color 0.32s ease;
}

.lixiang.collapsed {
  width: var(--rail-w);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  border-color: rgba(90, 138, 140, 0.14);
}

.lixiang.collapsed::before {
  background: rgba(8, 14, 22, 0.08);
}

.lixiang-rail {
  position: relative;
  z-index: 1;
  flex: 0 0 var(--rail-w);
  width: var(--rail-w);
  appearance: none;
  border: none;
  border-right: 1px solid var(--rule);
  background: transparent;
  color: var(--jin-mute);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0;
  min-height: var(--tap-min);
  transition: background 0.2s, color 0.2s;
  text-shadow: var(--text-glow);
}

.lixiang.collapsed .lixiang-rail {
  border-right: none;
}

.lixiang-rail:hover {
  background: rgba(184, 150, 74, 0.06);
  color: rgba(201, 168, 104, 0.98);
}

.rail-mark {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1;
  opacity: 0.75;
}

.rail-title {
  writing-mode: vertical-rl;
  font-family: var(--font-serif);
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  line-height: 1;
}

.lixiang-shell {
  position: relative;
  z-index: 1;
  flex: 1 1 0%;
  width: var(--panel-w);
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.22s ease;
  background: transparent;
}

.lixiang.collapsed .lixiang-shell {
  opacity: 0;
  pointer-events: none;
}

.lixiang-body {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.62rem var(--panel-pad-x) 0.55rem;
  background: transparent;
}

.lixiang-fixed {
  flex: 0 0 auto;
  background: transparent;
}

.lixiang-fixed :deep(.panel-section + .panel-section) {
  margin-top: 0.55rem;
  padding-top: 0.52rem;
  border-top: 1px solid var(--rule);
}

@media (max-width: 720px) {
  .lixiang {
    --rail-w: 2.75rem;
    --panel-w: min(16.5rem, calc(100vw - 1.3rem - var(--rail-w) - var(--safe-right)));
    position: fixed;
    z-index: 25;
    right: calc(0.65rem + var(--safe-right));
    left: auto;
    top: auto;
    bottom: calc(0.55rem + var(--safe-bottom));
    height: min(52vh, calc(100% - 1.1rem - var(--safe-bottom)));
    max-height: min(52vh, calc(100% - 1.1rem - var(--safe-bottom)));
    border-radius: 0.55rem 0 0 0.55rem;
    box-shadow:
      0 -4px 24px rgba(0, 0, 0, 0.28),
      0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .lixiang-rail {
    min-width: var(--rail-w);
    min-height: var(--tap-min);
  }

  .rail-title {
    font-size: 0.68rem;
    letter-spacing: 0.22em;
  }
}

@media (max-width: 480px) {
  .lixiang:not(.collapsed) {
    --panel-w: calc(100vw - 0.9rem - var(--rail-w) - var(--safe-left) - var(--safe-right));
    left: calc(0.45rem + var(--safe-left));
    right: calc(0.45rem + var(--safe-right));
    width: auto;
  }
}
</style>
