<script setup>
import { version } from '../../package.json'

const versionLabel = `v${version}`
</script>

<template>
  <footer class="site-footer" aria-label="站点页脚">
    <div class="foot-brand">
      <span class="foot-name">七政</span>
      <span class="foot-sub">历象 · 授时 · 节气</span>
      <span class="foot-version">{{ versionLabel }}</span>
    </div>
    <nav class="foot-links" aria-label="页脚链接">
      <a
        class="foot-link"
        href="https://github.com/adiudiuu/dipper"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
      >
        <svg class="foot-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        <span>GitHub</span>
      </a>
    </nav>
  </footer>
</template>

<style scoped>
.site-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding:
    0.38rem
    calc(1.15rem + var(--safe-right))
    calc(0.38rem + var(--safe-bottom))
    calc(1.15rem + var(--safe-left));
  background: linear-gradient(
    0deg,
    rgba(8, 14, 22, 0.88) 0%,
    rgba(8, 14, 22, 0.42) 70%,
    rgba(8, 14, 22, 0) 100%
  );
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.foot-brand,
.foot-links,
.foot-link {
  pointer-events: auto;
}

.foot-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  min-width: 0;
}

.foot-name {
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: rgba(90, 138, 140, 0.72);
}

.foot-sub {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  color: rgba(110, 154, 156, 0.42);
  white-space: nowrap;
}

.foot-version {
  font-family: var(--font-mono);
  font-size: 0.52rem;
  letter-spacing: 0.06em;
  color: rgba(110, 154, 156, 0.28);
  white-space: nowrap;
}

.foot-links {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.foot-link {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-height: var(--tap-min);
  padding: 0.12rem 0.1rem;
  font-family: var(--font-sans);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: rgba(110, 154, 156, 0.48);
  text-decoration: none;
  transition: color 0.18s;
}

.foot-link:hover {
  color: rgba(110, 154, 156, 0.88);
}

.foot-icon {
  width: 0.72rem;
  height: 0.72rem;
  flex: 0 0 auto;
  opacity: 0.9;
}

@media (max-width: 720px) {
  .site-footer {
    z-index: 30;
    padding:
      0.22rem
      calc(0.65rem + var(--safe-right))
      calc(0.22rem + var(--safe-bottom))
      calc(0.65rem + var(--safe-left));
    gap: 0.3rem;
    flex-wrap: nowrap;
  }

  /* 顶栏已有品牌，页脚只留版本+链接，减占位 */
  .foot-name,
  .foot-sub {
    display: none;
  }

  .foot-version {
    font-size: 0.46rem;
    color: rgba(110, 154, 156, 0.32);
  }

  .foot-link {
    font-size: 0.52rem;
    letter-spacing: 0.1em;
    min-height: var(--tap-min);
    padding: 0.2rem 0.15rem;
  }
}

@media (max-width: 480px) {
  .foot-version {
    font-size: 0.42rem;
  }
}
</style>
