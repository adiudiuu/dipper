<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { JIEQI } from '../lib/calendar.js'
import { getJieqiTopicSlug } from '../data/jieqiTopics.js'

const props = defineProps({
  currentTerm: { type: String, required: true }
})

const emit = defineEmits(['open-topic'])

const router = useRouter()
const scroller = ref(null)
const terms = JIEQI

function openTopic(termName) {
  const slug = getJieqiTopicSlug(termName)
  if (!slug) return
  emit('open-topic', termName)
  router.push({ name: 'jieqi-topic', params: { slug } })
}

async function scrollCurrentIntoView(smooth = true) {
  await nextTick()
  const el = scroller.value?.querySelector('[data-current="1"]')
  el?.scrollIntoView({
    inline: 'center',
    block: 'nearest',
    behavior: smooth ? 'smooth' : 'auto'
  })
}

watch(
  () => props.currentTerm,
  () => {
    scrollCurrentIntoView(true)
  }
)

onMounted(() => {
  scrollCurrentIntoView(false)
})
</script>

<template>
  <div class="jieqi-strip" aria-label="二十四节气">
    <div ref="scroller" class="jieqi-strip-scroll" role="list">
      <button
        v-for="jq in terms"
        :key="jq.name"
        type="button"
        role="listitem"
        class="jieqi-chip"
        :class="{
          'is-current': jq.name === currentTerm,
          'is-zhong': jq.zhong
        }"
        :data-current="jq.name === currentTerm ? '1' : undefined"
        :aria-label="`${jq.name} 节气科普`"
        :title="`阅读 ${jq.name} 专题`"
        @click="openTopic(jq.name)"
      >{{ jq.name }}</button>
    </div>
  </div>
</template>

<style scoped>
.jieqi-strip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(var(--app-footer-h) + 3.05rem + var(--safe-bottom));
  z-index: 4;
  pointer-events: none;
  padding: 0 calc(0.35rem + var(--safe-left)) 0 calc(0.35rem + var(--safe-right));
}

.jieqi-strip-scroll {
  display: flex;
  gap: 0.28rem;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  pointer-events: auto;
  padding: 0.2rem 0.45rem;
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 0.7rem,
    #000 calc(100% - 0.7rem),
    transparent 100%
  );
}

.jieqi-strip-scroll::-webkit-scrollbar {
  display: none;
}

.jieqi-chip {
  appearance: none;
  flex: 0 0 auto;
  font-family: var(--font-serif);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  line-height: 1;
  padding: 0.32rem 0.42rem;
  color: rgba(118, 156, 158, 0.72);
  border: 1px solid rgba(90, 138, 140, 0.18);
  background: rgba(8, 14, 22, 0.42);
  backdrop-filter: blur(6px);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s;
  -webkit-tap-highlight-color: transparent;
}

.jieqi-chip:hover {
  color: rgba(201, 168, 104, 0.92);
  border-color: rgba(184, 150, 74, 0.35);
  background: rgba(184, 150, 74, 0.08);
}

.jieqi-chip.is-zhong {
  color: rgba(201, 168, 104, 0.82);
  border-color: rgba(184, 150, 74, 0.22);
}

.jieqi-chip.is-current {
  color: #ebdaa8;
  border-color: rgba(184, 150, 74, 0.55);
  background: rgba(184, 150, 74, 0.12);
  font-weight: 600;
  box-shadow: 0 0 10px rgba(184, 150, 74, 0.16);
}

@media (max-width: 720px) and (orientation: landscape) {
  .jieqi-strip {
    bottom: calc(var(--app-footer-h) + 2.55rem + var(--safe-bottom));
  }

  .jieqi-chip {
    font-size: 0.58rem;
    padding: 0.26rem 0.36rem;
  }
}
</style>
