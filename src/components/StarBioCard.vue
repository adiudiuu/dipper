<script setup>
defineProps({
  bio: { type: Object, required: true },
  active: { type: Boolean, default: false },
  expanded: { type: Boolean, default: false }
})

const emit = defineEmits(['click-bio', 'collapse'])
</script>

<template>
  <article
    class="bio-card"
    :class="{ active, expanded }"
  >
    <button
      type="button"
      class="bio-head"
      :aria-expanded="expanded"
      :aria-label="`${bio.title} · 明星小传${expanded ? '（已展开）' : ''}`"
      @click="emit('click-bio', bio.id)"
    >
      <span class="bio-title-row">
        <span class="bio-dot" aria-hidden="true"></span>
        <span class="bio-title">{{ bio.title }}</span>
        <span class="bio-marker">{{ expanded ? '−' : '+' }}</span>
      </span>
      <span class="bio-tagline">{{ bio.tagline }}</span>
    </button>

    <div v-if="expanded" class="bio-body">
      <p v-if="bio.quote" class="bio-quote">{{ bio.quote }}</p>
      <p class="bio-text">{{ bio.body }}</p>
      <div v-if="bio.tip" class="bio-tip">
        <span class="bio-tip-label">{{ bio.tipLabel || '学科事实' }}</span>
        <span class="bio-tip-text">{{ bio.tip }}</span>
      </div>
      <button
        type="button"
        class="bio-collapse"
        @click="emit('collapse', bio.id)"
      >收起正文 · 星仍高亮</button>
    </div>
  </article>
</template>

<style scoped>
.bio-card {
  border: 1px solid rgba(90, 138, 140, 0.18);
  border-radius: 0.42rem;
  margin-bottom: 0.35rem;
  background: rgba(8, 14, 22, 0.35);
  overflow: hidden;
  transition: border-color 0.18s, background 0.18s;
}

.bio-card.active {
  border-color: rgba(184, 150, 74, 0.42);
  background: rgba(184, 150, 74, 0.06);
}

.bio-head {
  appearance: none;
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.bio-title-row {
  display: flex;
  align-items: baseline;
  gap: 0.42rem;
}

.bio-dot {
  flex: 0 0 auto;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 50%;
  background: rgba(110, 154, 156, 0.7);
}

.bio-card.active .bio-dot {
  background: rgba(196, 164, 90, 0.9);
}

.bio-title {
  font-family: var(--font-serif);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  color: rgba(233, 228, 214, 0.92);
}

.bio-card.active .bio-title {
  color: #ebdaa8;
}

.bio-marker {
  flex: 0 0 auto;
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: rgba(110, 154, 156, 0.75);
}

.bio-tagline {
  display: block;
  margin: 0.24rem 0 0;
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  color: rgba(201, 194, 176, 0.5);
}

.bio-body {
  padding: 0 0.6rem 0.55rem;
}

.bio-quote {
  margin: 0 0 0.4rem;
  font-family: var(--font-serif);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: rgba(196, 164, 90, 0.86);
}

.bio-text {
  margin: 0;
  font-size: 0.68rem;
  line-height: 1.72;
  letter-spacing: 0.03em;
  color: rgba(201, 194, 176, 0.74);
}

.bio-tip {
  display: flex;
  gap: 0.42rem;
  margin-top: 0.5rem;
  padding: 0.42rem 0.5rem;
  border: 1px dashed rgba(90, 138, 140, 0.3);
  border-radius: 0.3rem;
  background: rgba(90, 138, 140, 0.06);
  font-size: 0.62rem;
  line-height: 1.6;
}

.bio-tip-label {
  flex: 0 0 auto;
  padding-top: 0.08rem;
  font-size: 0.5rem;
  letter-spacing: 0.14em;
  color: rgba(110, 154, 156, 0.85);
  white-space: nowrap;
}

.bio-tip-text {
  color: rgba(201, 194, 176, 0.68);
}

.bio-collapse {
  appearance: none;
  display: block;
  margin: 0.5rem 0 0;
  margin-left: auto;
  border: 1px solid rgba(90, 138, 140, 0.24);
  border-radius: 0.26rem;
  background: transparent;
  color: rgba(110, 154, 156, 0.72);
  font-family: var(--font-sans);
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  padding: 0.3rem 0.55rem;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
}

.bio-collapse:hover {
  color: rgba(196, 164, 90, 0.85);
  border-color: rgba(196, 164, 90, 0.4);
}
</style>