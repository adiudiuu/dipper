<script setup>
defineProps({
  open: { type: Boolean, default: false },
  name: { type: String, default: '' },
  culture: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const SECTIONS = [
  { key: 'origin', label: '由来' },
  { key: 'myth', label: '典故' },
  { key: 'modernRef', label: '今用' }
]
</script>

<template>
  <Teleport to="body">
    <Transition name="culture-fade">
      <div
        v-if="open && culture"
        class="culture-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`${name} · 星官故事`"
        @click.self="emit('close')"
      >
        <div class="culture-card glass-panel">
          <header class="culture-head">
            <div class="culture-title-wrap">
              <span class="culture-badge">星官故事</span>
              <h2 class="culture-title">{{ name }}</h2>
            </div>
            <button
              type="button"
              class="culture-close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ×
            </button>
          </header>

          <div class="culture-body">
            <section
              v-for="sec in SECTIONS"
              :key="sec.key"
              v-show="culture[sec.key]"
              class="culture-section"
            >
              <div class="sec-label">{{ sec.label }}</div>
              <p class="sec-text">{{ culture[sec.key] }}</p>
            </section>
          </div>

          <footer class="culture-foot">
            <span class="foot-note">教学科普 · 非占卜预测</span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.glass-panel {
  --panel-bg: rgba(8, 14, 22, 0.88);
  --panel-border: rgba(90, 138, 140, 0.28);
  --ink: #c9c2b0;
  --ink-faint: rgba(201, 194, 176, 0.45);
  --qing-label: rgba(110, 154, 156, 0.72);
  --jin: #c4a45a;
  --jin-mute: rgba(196, 164, 90, 0.55);
  --label-size: 0.52rem;
  --label-track: 0.22em;
  --body-size: 0.72rem;
  --text-glow: 0 1px 2px rgba(0, 0, 0, 0.65);
}

.culture-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-bottom: calc(1rem + var(--safe-bottom));
  padding-top: calc(1rem + var(--safe-top));
  background: rgba(4, 8, 14, 0.52);
  backdrop-filter: blur(4px);
  -webkit-tap-highlight-color: transparent;
}

.culture-card {
  position: relative;
  width: min(22rem, 100%);
  max-height: min(70vh, calc(100% - 2rem - var(--safe-top) - var(--safe-bottom)));
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-border);
  border-radius: 0.55rem;
  background: var(--panel-bg);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.38),
    0 0 0 1px rgba(90, 138, 140, 0.08) inset;
  color: var(--ink);
  text-shadow: var(--text-glow);
  overflow: hidden;
}

.culture-head {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem 0.65rem;
  border-bottom: 1px solid rgba(90, 138, 140, 0.16);
}

.culture-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
}

.culture-badge {
  font-family: var(--font-sans);
  font-size: var(--label-size);
  letter-spacing: var(--label-track);
  color: var(--qing-label);
}

.culture-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--jin);
  line-height: 1.35;
}

.culture-close {
  appearance: none;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  margin: -0.15rem -0.25rem 0 0;
  border: 1px solid rgba(90, 138, 140, 0.28);
  border-radius: 0.35rem;
  background: rgba(8, 14, 22, 0.5);
  color: var(--ink-faint);
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
}

.culture-close:hover {
  color: var(--jin);
  border-color: rgba(196, 164, 90, 0.45);
}

.culture-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0.65rem 0.95rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  -webkit-overflow-scrolling: touch;
}

.culture-section {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.sec-label {
  font-size: var(--label-size);
  letter-spacing: var(--label-track);
  color: var(--qing-label);
}

.sec-text {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--body-size);
  line-height: 1.65;
  letter-spacing: 0.04em;
  color: var(--ink);
}

.culture-foot {
  flex: 0 0 auto;
  padding: 0.45rem 0.95rem 0.65rem;
  border-top: 1px solid rgba(90, 138, 140, 0.12);
}

.foot-note {
  font-size: 0.52rem;
  letter-spacing: 0.1em;
  color: var(--ink-faint);
}

/* 移动端底栏样式 */
@media (max-width: 720px) {
  .culture-overlay {
    align-items: flex-end;
    padding: 0;
    padding-bottom: var(--safe-bottom);
    background: rgba(4, 8, 14, 0.58);
  }

  .culture-card {
    width: 100%;
    max-height: min(72vh, calc(100% - var(--safe-top) - 3rem));
    border-radius: 0.65rem 0.65rem 0 0;
    border-bottom: none;
  }

  .culture-close {
    width: var(--tap-min);
    height: var(--tap-min);
    margin: 0;
  }

  .culture-head {
    padding: 0.75rem 0.85rem 0.55rem;
  }

  .culture-body {
    padding: 0.55rem 0.85rem 0.65rem;
  }
}

.culture-fade-enter-active,
.culture-fade-leave-active {
  transition: opacity 0.22s ease;
}

.culture-fade-enter-active .culture-card,
.culture-fade-leave-active .culture-card {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}

.culture-fade-enter-from,
.culture-fade-leave-to {
  opacity: 0;
}

.culture-fade-enter-from .culture-card {
  transform: translateY(1.2rem);
  opacity: 0.85;
}

.culture-fade-leave-to .culture-card {
  transform: translateY(0.6rem);
  opacity: 0;
}

@media (min-width: 721px) {
  .culture-fade-enter-from .culture-card {
    transform: translateY(0.5rem) scale(0.98);
  }
}
</style>
