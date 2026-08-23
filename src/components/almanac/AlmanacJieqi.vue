<script setup>
import { computed, useId } from 'vue'
import { SYNODIC } from '../../lib/calendar.js'
import { getTodayCultureTip } from '../../lib/cultureTips.js'

const props = defineProps({
  currentTerm: { type: String, required: true },
  termIntoDays: { type: Number, required: true },
  termSub: { type: String, required: true },
  phaseFrac: { type: Number, required: true },
  phaseLabel: { type: String, required: true },
  moonAge: { type: Number, required: true },
  todayFestivals: { type: Array, default: () => [] }
})

const moonUid = useId()
const moonGradId = computed(() => `${moonUid}-g`)
const moonMaskId = computed(() => `${moonUid}-m`)
const moonBlurId = computed(() => `${moonUid}-b`)

const cultureTip = computed(() =>
  getTodayCultureTip({
    termName: props.currentTerm,
    festivals: props.todayFestivals
  })
)

const moonLitD = computed(() => {
  const f = Math.max(0, Math.min(1, props.phaseFrac))
  const R = 28
  const CX = 32
  const CY = 32
  if (f >= 0.995) {
    return `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R} Z`
  }
  if (f <= 0.005) return ''
  const waxing = props.moonAge / SYNODIC < 0.5
  const rx = Math.max(0.35, R * Math.abs(1 - 2 * f))
  const top = `${CX} ${CY - R}`
  const bot = `${CX} ${CY + R}`
  if (waxing) {
    const termSweep = f <= 0.5 ? 0 : 1
    return `M ${top} A ${R} ${R} 0 0 1 ${bot} A ${rx} ${R} 0 0 ${termSweep} ${top}`
  }
  const termSweep = f <= 0.5 ? 1 : 0
  return `M ${top} A ${R} ${R} 0 0 0 ${bot} A ${rx} ${R} 0 0 ${termSweep} ${top}`
})
</script>

<template>
  <section class="panel-section">
    <div class="sec-label">节气 · 月相</div>
    <div class="term-line">
      <span class="term-name">{{ currentTerm }}</span>
      <span class="term-meta">已过 {{ termIntoDays }} 天</span>
    </div>
    <div class="term-sub">{{ termSub }}</div>
    <div class="phase-row" aria-label="月相">
      <svg
        class="moon-disc"
        viewBox="0 0 64 64"
        width="22"
        height="22"
        aria-hidden="true"
      >
        <defs>
          <radialGradient
            :id="moonGradId"
            cx="34%"
            cy="30%"
            r="68%"
          >
            <stop offset="0%" stop-color="#f8f4ea" />
            <stop offset="42%" stop-color="#e2dac8" />
            <stop offset="78%" stop-color="#b9b09a" />
            <stop offset="100%" stop-color="#8a8270" />
          </radialGradient>
          <filter :id="moonBlurId" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.55" />
          </filter>
          <mask :id="moonMaskId" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="64" height="64" fill="#000" />
            <path
              v-if="moonLitD"
              :d="moonLitD"
              fill="#fff"
              :filter="`url(#${moonBlurId})`"
            />
          </mask>
        </defs>
        <circle cx="32" cy="32" r="28" class="moon-night" />
        <g :mask="`url(#${moonMaskId})`">
          <circle cx="32" cy="32" r="28" :fill="`url(#${moonGradId})`" />
          <ellipse cx="24" cy="27" rx="7.2" ry="5.2" class="moon-mare" />
          <ellipse cx="38" cy="36" rx="5.4" ry="4.2" class="moon-mare" />
          <ellipse cx="30" cy="42" rx="4.2" ry="3.2" class="moon-mare moon-mare-soft" />
          <circle cx="41" cy="24" r="2.4" class="moon-crater" />
          <circle cx="22" cy="38" r="1.8" class="moon-crater" />
          <ellipse
            cx="26"
            cy="22"
            rx="10"
            ry="7"
            class="moon-sheen"
          />
        </g>
        <circle cx="32" cy="32" r="28" class="moon-rim" />
      </svg>
      <span class="phase-name">{{ phaseLabel }}</span>
      <span class="phase-pct">照明 {{ Math.round(phaseFrac * 100) }}%</span>
    </div>
    <div v-if="todayFestivals.length" class="fest-tags">
      <span v-for="f in todayFestivals" :key="f.name" class="mini-tag">{{ f.name }}</span>
    </div>
    <div v-if="cultureTip" class="culture-tip">
      <div class="sec-label">今日小知识</div>
      <div class="tip-title">{{ cultureTip.title }}</div>
      <p v-for="(line, i) in cultureTip.lines" :key="i" class="tip-text">{{ line }}</p>
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

.term-line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.35rem 0.55rem;
  line-height: 1.35;
}

.term-name {
  font-family: var(--font-serif);
  font-size: var(--term-name-size);
  font-weight: 600;
  color: var(--jin);
  letter-spacing: 0.16em;
  text-shadow: var(--text-glow);
}

.term-meta {
  font-family: var(--font-sans);
  font-size: var(--term-meta-size);
  color: var(--qing-mute);
  letter-spacing: 0.08em;
}

.term-sub {
  margin-top: 0.1rem;
  font-size: var(--mute-size);
  color: var(--qing-faint);
  letter-spacing: 0.06em;
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

.phase-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.42rem;
  padding-top: 0.38rem;
  border-top: 1px solid var(--rule);
}

.moon-disc {
  flex: 0 0 auto;
  display: block;
  overflow: visible;
  filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.55));
}

.moon-night {
  fill: #0b1018;
}

.moon-mare {
  fill: rgba(72, 68, 58, 0.28);
}

.moon-mare-soft {
  fill: rgba(72, 68, 58, 0.16);
}

.moon-crater {
  fill: rgba(60, 56, 48, 0.2);
}

.moon-sheen {
  fill: rgba(255, 252, 245, 0.22);
}

.moon-rim {
  fill: none;
  stroke: rgba(110, 154, 156, 0.28);
  stroke-width: 1.2;
}

.phase-name {
  font-family: var(--font-sans);
  font-size: var(--body-size);
  color: var(--qing-mute);
  letter-spacing: 0.08em;
}

.phase-pct {
  font-family: var(--font-mono);
  font-size: var(--mono-size);
  letter-spacing: 0.04em;
  color: var(--ink-faint);
}

.fest-tags {
  margin-top: 0.28rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
}

.fest-tags .mini-tag {
  margin-left: 0;
}

.culture-tip {
  margin-top: 0.42rem;
  padding-top: 0.38rem;
  border-top: 1px solid var(--rule);
}

.tip-title {
  font-family: var(--font-serif);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--jin-soft);
  letter-spacing: 0.12em;
  line-height: 1.4;
  margin-bottom: 0.12rem;
}

.tip-text {
  margin: 0.18rem 0 0;
  font-size: var(--mute-size);
  line-height: 1.55;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}
</style>
