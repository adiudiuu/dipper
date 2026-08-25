<template>
  <div class="scene-loading" aria-busy="true" aria-label="载入星象">
    <div class="scene-loading-inner">
      <span class="scene-loading-dot" />
      <span class="scene-loading-text">载入星象</span>
    </div>
  </div>
</template>

<style scoped>
.scene-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(6, 10, 16, 0.35);
  pointer-events: none;
}

.scene-loading-inner {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.85rem;
  border: 1px solid rgba(90, 138, 140, 0.22);
  background: rgba(8, 14, 22, 0.72);
  backdrop-filter: blur(8px);
}

.scene-loading-dot {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 50%;
  background: rgba(140, 190, 195, 0.85);
  animation: pulse 1.2s ease-in-out infinite;
}

.scene-loading-text {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: rgba(180, 200, 205, 0.75);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
