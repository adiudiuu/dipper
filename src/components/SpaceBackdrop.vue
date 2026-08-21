<template>
  <div class="space-bg" aria-hidden="true">
    <div class="nebula nebula-a" />
    <div class="nebula nebula-b" />
    <div class="nebula nebula-c" />
    <div class="stars stars-far" />
    <div class="stars stars-near" />
    <div class="dust" />
  </div>
</template>

<style scoped>
.space-bg {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse 90% 70% at 50% 115%, rgba(28, 48, 62, 0.5) 0%, transparent 55%),
    radial-gradient(ellipse 55% 45% at 12% 16%, rgba(40, 72, 88, 0.32) 0%, transparent 60%),
    radial-gradient(ellipse 45% 35% at 88% 22%, rgba(120, 70, 40, 0.14) 0%, transparent 55%),
    linear-gradient(165deg, #070b12 0%, #0a121c 45%, #0c1520 100%);
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(52px);
  opacity: 0.45;
  mix-blend-mode: screen;
}

.nebula-a {
  width: 48vmax;
  height: 36vmax;
  left: -8%;
  top: -12%;
  background: radial-gradient(circle, rgba(60, 110, 130, 0.45) 0%, transparent 70%);
  animation: drift-a 28s ease-in-out infinite alternate;
}

.nebula-b {
  width: 40vmax;
  height: 32vmax;
  right: -10%;
  top: 8%;
  background: radial-gradient(circle, rgba(160, 100, 55, 0.2) 0%, transparent 70%);
  animation: drift-b 34s ease-in-out infinite alternate;
}

.nebula-c {
  width: 55vmax;
  height: 40vmax;
  left: 20%;
  bottom: -18%;
  background: radial-gradient(circle, rgba(45, 90, 115, 0.4) 0%, transparent 68%);
  animation: drift-c 40s ease-in-out infinite alternate;
}

.stars {
  position: absolute;
  inset: -10%;
  background-repeat: repeat;
  opacity: 0.85;
}

.stars-far {
  background-image: radial-gradient(1.2px 1.2px at 12% 18%, rgba(233, 228, 214, 0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 28% 64%, rgba(180, 210, 230, 0.65) 0%, transparent 100%),
    radial-gradient(1.4px 1.4px at 44% 22%, rgba(255, 240, 210, 0.75) 0%, transparent 100%),
    radial-gradient(1px 1px at 62% 48%, rgba(233, 228, 214, 0.55) 0%, transparent 100%),
    radial-gradient(1.2px 1.2px at 78% 16%, rgba(170, 210, 240, 0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 72%, rgba(233, 228, 214, 0.5) 0%, transparent 100%),
    radial-gradient(1.3px 1.3px at 6% 82%, rgba(255, 230, 180, 0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 52% 88%, rgba(200, 220, 240, 0.55) 0%, transparent 100%);
  background-size: 280px 280px;
  animation: twinkle 7s ease-in-out infinite alternate;
}

.stars-near {
  background-image: radial-gradient(1.6px 1.6px at 18% 30%, rgba(255, 250, 235, 0.95) 0%, transparent 100%),
    radial-gradient(1.4px 1.4px at 70% 20%, rgba(200, 230, 255, 0.9) 0%, transparent 100%),
    radial-gradient(1.8px 1.8px at 40% 70%, rgba(255, 236, 200, 0.85) 0%, transparent 100%),
    radial-gradient(1.3px 1.3px at 85% 55%, rgba(233, 228, 214, 0.8) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 55% 40%, rgba(180, 220, 255, 0.75) 0%, transparent 100%);
  background-size: 420px 420px;
  opacity: 0.7;
  animation: twinkle 5.5s ease-in-out infinite alternate-reverse;
}

.dust {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 40% 25% at 30% 35%, rgba(140, 180, 200, 0.08) 0%, transparent 70%),
    radial-gradient(ellipse 35% 30% at 70% 60%, rgba(180, 140, 100, 0.06) 0%, transparent 70%);
  mix-blend-mode: screen;
}

@keyframes drift-a {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(4%, 3%) scale(1.06); }
}
@keyframes drift-b {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-3%, 4%) scale(1.08); }
}
@keyframes drift-c {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(2%, -3%) scale(1.05); }
}
@keyframes twinkle {
  from { opacity: 0.55; }
  to { opacity: 0.9; }
}
</style>
