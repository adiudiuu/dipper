<script setup>
defineProps({
  solarText: { type: String, required: true }
})
</script>

<template>
  <section class="panel-section">
    <div class="sec-label">公历</div>
    <div class="readout-solar">{{ solarText }}</div>
  </section>
</template>

<style scoped>
.panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}

.sec-label {
  font-size: var(--label-size);
  letter-spacing: var(--label-track);
  color: var(--qing-label);
  margin-bottom: 0.1rem;
  font-weight: 400;
}

.readout-solar {
  font-family: var(--font-sans);
  font-size: var(--solar-size);
  font-weight: 400;
  color: var(--ink-soft);
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-shadow: var(--text-glow);
}
</style>
