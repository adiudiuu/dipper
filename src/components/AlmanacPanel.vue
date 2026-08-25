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

const emit = defineEmits(['toggle', 'jump', 'panel-wheel', 'open-topic'])

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
            @open-topic="emit('open-topic', $event)"
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
    --rail-w: 100%;
    --panel-w: 100%;
    --sheet-h: min(58vh, calc(100dvh - var(--app-footer-h) - 5.5rem - var(--safe-top)));
    --lixiang-bottom: calc(var(--app-footer-h) + var(--safe-bottom));
    position: fixed;
    z-index: 25;
    left: 0;
    right: 0;
    top: auto;
    bottom: var(--lixiang-bottom);
    width: 100%;
    height: var(--sheet-h);
    max-height: var(--sheet-h);
    flex-direction: column;
    border-radius: 0.85rem 0.85rem 0 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(90, 138, 140, 0.12);
    transition:
      height 0.32s cubic-bezier(0.4, 0, 0.2, 1),
      max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.32s ease,
      border-radius 0.32s ease,
      width 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .lixiang::before {
    background: rgba(8, 14, 22, 0.88);
    backdrop-filter: blur(14px);
  }

  /* 收起：左下角胶囊，避开 GitHub */
  .lixiang.collapsed {
    left: calc(0.55rem + var(--safe-left));
    right: auto;
    width: auto;
    height: auto;
    max-height: none;
    min-height: 0;
    border-radius: 999px;
    border: 1px solid rgba(90, 138, 140, 0.28);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
  }

  .lixiang.collapsed::before {
    background: rgba(8, 14, 22, 0.78);
    border-radius: inherit;
  }

  .lixiang.collapsed .lixiang-rail {
    flex-direction: row;
    width: auto;
    min-width: 0;
    min-height: var(--tap-min);
    padding: 0.35rem 0.95rem;
    border: none;
    gap: 0.35rem;
  }

  .lixiang.collapsed .rail-mark {
    transform: rotate(-90deg);
  }

  .lixiang.collapsed .rail-title {
    writing-mode: horizontal-tb;
    letter-spacing: 0.22em;
    font-size: 0.72rem;
  }

  .lixiang.collapsed .lixiang-shell {
    display: none;
  }

  .lixiang-rail {
    flex: 0 0 auto;
    flex-direction: row;
    width: 100%;
    min-width: 0;
    min-height: var(--tap-min);
    padding: 0.55rem 1rem 0.4rem;
    border-right: none;
    border-bottom: 1px solid var(--rule);
    gap: 0.45rem;
    justify-content: center;
  }

  .rail-mark {
    font-size: 0.85rem;
    transform: rotate(90deg);
  }

  .rail-title {
    writing-mode: horizontal-tb;
    font-size: 0.78rem;
    letter-spacing: 0.28em;
  }

  .lixiang-shell {
    width: 100%;
    flex: 1 1 auto;
  }

  .lixiang-body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding-bottom: calc(0.55rem + var(--safe-bottom));
  }
}

@media (max-width: 480px) {
  .lixiang:not(.collapsed) {
    --sheet-h: min(62vh, calc(100dvh - var(--app-footer-h) - 5rem - var(--safe-top)));
    height: var(--sheet-h);
    max-height: var(--sheet-h);
  }
}

@media (max-width: 720px) and (orientation: landscape) {
  .lixiang:not(.collapsed) {
    --sheet-h: min(82vh, calc(100dvh - var(--app-footer-h) - 3.2rem - var(--safe-top)));
    left: auto;
    right: 0;
    width: min(22rem, 52vw);
    height: var(--sheet-h);
    max-height: var(--sheet-h);
    border-radius: 0.75rem 0 0 0;
    border-left: 1px solid var(--panel-border);
  }

  .lixiang.collapsed {
    left: calc(0.45rem + var(--safe-left));
  }
}
</style>
