<script setup>
import { computed } from 'vue'
import { FOUR_ANIMALS } from '../lib/fourAnimals.js'

const props = defineProps({
  /** 当前激活的象 id（'' = 关闭） */
  activeId: { type: String, default: '' }
})

const emit = defineEmits(['select'])

/** 上北下南左西右东 · 与观天授时方位一致 */
const SLOTS = [
  { slot: 'north', dir: '北' },
  { slot: 'west', dir: '西' },
  { slot: 'east', dir: '东' },
  { slot: 'south', dir: '南' }
]

const slotMap = computed(() => {
  const m = {}
  FOUR_ANIMALS.forEach((a) => {
    m[a.direction] = a
  })
  return m
})

function toggle(id) {
  emit('select', props.activeId === id ? '' : id)
}

function quadStyle(animal) {
  if (props.activeId !== animal.id) return undefined
  return {
    '--quad-accent': animal.color,
    borderColor: `${animal.color}99`,
    background: `${animal.color}22`,
    color: animal.color
  }
}
</script>

<template>
  <div class="quad-compass glass-caption" role="group" aria-label="四象拆解：方位罗盘">
    <div class="quad-compass-grid">
      <button
        v-for="s in SLOTS"
        :key="s.slot"
        type="button"
        class="quad-cell"
        :class="[`is-${s.slot}`, { active: activeId === slotMap[s.dir]?.id }]"
        :style="slotMap[s.dir] ? quadStyle(slotMap[s.dir]) : undefined"
        :aria-pressed="activeId === slotMap[s.dir]?.id"
        :title="`${slotMap[s.dir]?.name} · ${s.dir}方 · ${slotMap[s.dir]?.season}季 · 七宿体序`"
        @click="slotMap[s.dir] && toggle(slotMap[s.dir].id)"
      >
        <span class="quad-dir">{{ s.dir }}</span>
        <span class="quad-name">{{ slotMap[s.dir]?.name }}</span>
        <span class="quad-meta">{{ slotMap[s.dir]?.season }} · {{ slotMap[s.dir]?.element }}</span>
      </button>
      <div class="quad-hub" aria-hidden="true">
        <svg class="quad-hub-svg" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" class="hub-ring" />
          <line x1="24" y1="6" x2="24" y2="42" class="hub-axis" />
          <line x1="6" y1="24" x2="42" y2="24" class="hub-axis" />
          <circle cx="24" cy="24" r="2.8" class="hub-dot" />
        </svg>
        <span class="hub-label">四象</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quad-compass {
  position: absolute;
  right: 0.65rem;
  bottom: 0.65rem;
  z-index: 2;
  padding: 0.38rem 0.42rem;
  border-radius: 0.45rem;
  pointer-events: auto;
}

.glass-caption {
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(8, 14, 22, 0.72);
  backdrop-filter: blur(8px);
}

.quad-compass-grid {
  display: grid;
  grid-template-columns: 3.4rem 2.1rem 3.4rem;
  grid-template-rows: 2.55rem 2.1rem 2.55rem;
  grid-template-areas:
    '. north .'
    'west hub east'
    '. south .';
  gap: 0.18rem;
  align-items: stretch;
  justify-items: stretch;
}

.quad-cell {
  appearance: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.06rem;
  min-width: 0;
  border: 1px solid rgba(90, 138, 140, 0.28);
  border-radius: 0.32rem;
  background: rgba(8, 14, 22, 0.5);
  color: rgba(201, 194, 176, 0.62);
  font-family: var(--font-serif);
  cursor: pointer;
  padding: 0.18rem 0.12rem;
  transition: color 0.18s, border-color 0.18s, background 0.18s, box-shadow 0.18s;
  -webkit-tap-highlight-color: transparent;
}

.quad-cell.is-north {
  grid-area: north;
}
.quad-cell.is-west {
  grid-area: west;
}
.quad-cell.is-east {
  grid-area: east;
}
.quad-cell.is-south {
  grid-area: south;
}

.quad-cell:hover {
  color: #ebdaa8;
  border-color: rgba(196, 164, 90, 0.45);
}

.quad-cell.active {
  color: var(--quad-accent, #ebdaa8);
  box-shadow: 0 0 12px rgba(6, 10, 16, 0.35);
}

.quad-dir {
  font-size: 0.46rem;
  letter-spacing: 0.14em;
  color: rgba(110, 154, 156, 0.82);
}

.quad-cell.active .quad-dir {
  color: inherit;
  opacity: 0.78;
}

.quad-name {
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  line-height: 1.1;
}

.quad-meta {
  font-family: var(--font-sans);
  font-size: 0.44rem;
  letter-spacing: 0.06em;
  opacity: 0.72;
}

.quad-hub {
  grid-area: hub;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.04rem;
  pointer-events: none;
}

.quad-hub-svg {
  width: 1.65rem;
  height: 1.65rem;
}

.hub-ring {
  fill: none;
  stroke: rgba(90, 138, 140, 0.35);
  stroke-width: 1;
}

.hub-axis {
  stroke: rgba(90, 138, 140, 0.22);
  stroke-width: 0.8;
}

.hub-dot {
  fill: rgba(196, 164, 90, 0.65);
}

.hub-label {
  font-size: 0.44rem;
  letter-spacing: 0.2em;
  color: rgba(110, 154, 156, 0.75);
}

@media (max-width: 720px) {
  .quad-compass {
    right: 0.45rem;
    bottom: auto;
    top: 0.45rem;
    padding: 0.28rem 0.32rem;
  }

  .quad-compass-grid {
    grid-template-columns: 2.85rem 1.75rem 2.85rem;
    grid-template-rows: 2.2rem 1.75rem 2.2rem;
    gap: 0.14rem;
  }

  .quad-name {
    font-size: 0.62rem;
  }

  .quad-hub-svg {
    width: 1.45rem;
    height: 1.45rem;
  }
}
</style>
