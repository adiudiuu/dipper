<script setup>
defineProps({
  lunarMainText: { type: String, required: true },
  isLeapMonth: { type: Boolean, default: false },
  daoYearText: { type: String, required: true },
  suiXing: { type: Object, required: true }
})
</script>

<template>
  <section class="panel-section">
    <div class="sec-label">农历 · 道历</div>
    <div class="readout-lunar">
      {{ lunarMainText }}
      <span v-if="isLeapMonth" class="mini-tag">闰</span>
    </div>
    <div class="readout-dao">
      <span title="道历＝公历＋2697；年数随公历换年；干支生肖依农历新年">{{ daoYearText }}</span>
      <template v-if="suiXing.text">
        <span aria-hidden="true"> · </span>
        <span
          :title="suiXing.lon != null ? `木星地心黄经约 ${suiXing.lon.toFixed(1)}°` : undefined"
        >{{ suiXing.text }}</span>
      </template>
    </div>
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

.readout-lunar {
  font-family: var(--font-sans);
  font-size: var(--lunar-size);
  font-weight: 500;
  color: var(--ink);
  letter-spacing: 0.08em;
  line-height: 1.35;
  text-shadow: var(--text-glow);
}

.readout-dao {
  margin-top: 0.12rem;
  font-size: var(--mute-size);
  color: var(--ink-dim);
  letter-spacing: 0.08em;
}

.mini-tag {
  display: inline-block;
  margin-left: 0.22rem;
  padding: 0.04rem 0.32rem;
  font-size: 0.5rem;
  font-family: var(--font-sans);
  color: var(--jin-mute);
  border: 1px solid rgba(196, 164, 90, 0.28);
  letter-spacing: 0.12em;
  vertical-align: middle;
  background: rgba(196, 164, 90, 0.06);
  line-height: 1.35;
}
</style>
