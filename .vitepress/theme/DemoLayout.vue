<script setup lang="ts">
import BachDemo from '@/components/BachDemo.vue'
import { useData } from 'vitepress'
import { computed, onMounted } from 'vue'
import wasmMeta from '@/wasm/meta.json'
import { useBachStore } from '@/stores/useBachStore'

const { lang } = useData()
const store = useBachStore()

const wasmHash = computed(() => wasmMeta.md5.slice(0, 7))

// Locale configuration
const locales = {
  en: { label: 'English', shortLabel: 'EN', path: '', docsLabel: 'Docs' },
  ja: { label: '日本語', shortLabel: '日本語', path: '/ja', docsLabel: 'ドキュメント' },
} as const

type LocaleKey = keyof typeof locales
const defaultLocale: LocaleKey = 'en'

const currentLocale = computed(() => locales[lang.value as LocaleKey] || locales[defaultLocale])
const localePath = (path: string) => `${currentLocale.value.path}${path}`

const otherLocales = computed(() =>
  Object.entries(locales)
    .filter(([key]) => key !== lang.value)
    .map(([key, config]) => ({ key, ...config }))
)
</script>

<template>
  <div class="demo-page" :class="`demo-page--${lang}`">
    <!-- Ambient Background -->
    <div class="demo-page__backdrop">
      <div class="demo-page__pipes"></div>
      <div class="demo-page__wave demo-page__wave--1"></div>
      <div class="demo-page__wave demo-page__wave--2"></div>
      <div class="demo-page__wave demo-page__wave--3"></div>
      <div class="demo-page__orb demo-page__orb--1"></div>
      <div class="demo-page__orb demo-page__orb--2"></div>
      <div class="demo-page__orb demo-page__orb--3"></div>
      <div class="demo-page__noise"></div>
    </div>

    <!-- Main Demo Area -->
    <main class="demo-page__main">
      <BachDemo />
    </main>

    <!-- Minimal Footer -->
    <footer class="demo-page__footer">
      <div class="demo-page__footer-links">
        <a
          href="https://github.com/libraz/midi-sketch-bach"
          target="_blank"
          rel="noopener noreferrer"
          class="demo-page__link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </a>
        <span class="demo-page__divider">&middot;</span>
        <a :href="localePath('/docs/getting-started')" class="demo-page__link">
          <span>{{ currentLocale.docsLabel }}</span>
        </a>
        <template v-for="locale in otherLocales" :key="locale.key">
          <span class="demo-page__divider">&middot;</span>
          <a :href="locale.path || '/'" class="demo-page__link demo-page__lang-switch">
            <span>{{ locale.shortLabel }}</span>
          </a>
        </template>
      </div>
      <div class="demo-page__footer-version">
        <span class="demo-page__version" :title="`WASM Build: ${wasmMeta.md5}`">
          midi-sketch-bach {{ store.libVersion.value || '...' }} ({{ wasmHash }})
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.demo-page {
  --demo-bg: #0A0A0E;
  --demo-text: rgba(228, 224, 218, 0.55);
  --demo-text-muted: rgba(228, 224, 218, 0.3);

  min-height: 100vh;
  min-height: 100dvh;
  background: var(--demo-bg);
  display: flex;
  overscroll-behavior: none;
  flex-direction: column;
  font-family: 'DM Sans', system-ui, sans-serif;
}

/* Backdrop — minimal ambient light */
.demo-page__backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.demo-page__pipes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 35vh;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 20px,
    rgba(184, 146, 46, 0.012) 20px,
    rgba(184, 146, 46, 0.012) 21px
  );
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%);
}

/* Atmospheric waves — slow undulating light */
.demo-page__wave {
  position: absolute;
  width: 200%;
  height: 100%;
  left: -50%;
  top: 0;
  pointer-events: none;
}

.demo-page__wave--1 {
  background:
    radial-gradient(ellipse 80% 40% at 30% 60%, rgba(168, 152, 120, 0.035) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 70% 40%, rgba(168, 152, 120, 0.025) 0%, transparent 60%);
  animation: wave-drift-1 45s ease-in-out infinite;
}

.demo-page__wave--2 {
  background:
    radial-gradient(ellipse 70% 35% at 55% 55%, rgba(138, 46, 62, 0.02) 0%, transparent 65%),
    radial-gradient(ellipse 50% 45% at 25% 45%, rgba(168, 152, 120, 0.02) 0%, transparent 55%);
  animation: wave-drift-2 55s ease-in-out infinite;
}

.demo-page__wave--3 {
  background:
    radial-gradient(ellipse 90% 30% at 45% 70%, rgba(61, 74, 92, 0.025) 0%, transparent 60%),
    radial-gradient(ellipse 40% 55% at 80% 30%, rgba(168, 152, 120, 0.018) 0%, transparent 55%);
  animation: wave-drift-3 65s ease-in-out infinite;
}

@keyframes wave-drift-1 {
  0%   { transform: translateX(0%)   translateY(0%)   scale(1); }
  25%  { transform: translateX(8%)   translateY(-3%)  scale(1.05); }
  50%  { transform: translateX(3%)   translateY(2%)   scale(0.97); }
  75%  { transform: translateX(-5%)  translateY(-1%)  scale(1.03); }
  100% { transform: translateX(0%)   translateY(0%)   scale(1); }
}

@keyframes wave-drift-2 {
  0%   { transform: translateX(0%)   translateY(0%)   scale(1); }
  30%  { transform: translateX(-6%)  translateY(4%)   scale(1.04); }
  60%  { transform: translateX(5%)   translateY(-2%)  scale(0.96); }
  100% { transform: translateX(0%)   translateY(0%)   scale(1); }
}

@keyframes wave-drift-3 {
  0%   { transform: translateX(0%)   translateY(0%)   scale(1); }
  20%  { transform: translateX(4%)   translateY(3%)   scale(1.02); }
  45%  { transform: translateX(-7%)  translateY(-1%)  scale(1.06); }
  70%  { transform: translateX(2%)   translateY(-4%)  scale(0.98); }
  100% { transform: translateX(0%)   translateY(0%)   scale(1); }
}

.demo-page__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}

.demo-page__orb--1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(168, 152, 120, 0.1) 0%, transparent 60%);
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  animation: float-orb-1 25s ease-in-out infinite;
}

.demo-page__orb--2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(138, 46, 62, 0.06) 0%, transparent 60%);
  bottom: -5%;
  left: -8%;
  animation: float-orb-2 30s ease-in-out infinite;
}

.demo-page__orb--3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(61, 74, 92, 0.05) 0%, transparent 60%);
  top: 35%;
  right: -5%;
  animation: float-orb-3 20s ease-in-out infinite;
}

@keyframes float-orb-1 {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(12px); }
}

@keyframes float-orb-2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-8px) translateX(5px); }
  66% { transform: translateY(4px) translateX(-3px); }
}

@keyframes float-orb-3 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.demo-page__noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.015;
  mix-blend-mode: overlay;
}

/* Main Content */
.demo-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
  min-height: 0;
}

/* Footer */
.demo-page__footer {
  position: relative;
  z-index: 2;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.demo-page__footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.demo-page__footer-version {
  display: flex;
  justify-content: center;
}

.demo-page__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  color: var(--demo-text-muted);
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.demo-page__link:hover {
  color: var(--demo-text);
  background: rgba(168, 152, 120, 0.08);
}

.demo-page__link svg {
  opacity: 0.6;
}

.demo-page__divider {
  color: var(--demo-text-muted);
  opacity: 0.3;
  user-select: none;
}

.demo-page__lang-switch {
  font-weight: 600;
  letter-spacing: 0.05em;
}

.demo-page__version {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: var(--demo-text-muted);
  opacity: 0.5;
  letter-spacing: 0.04em;
  cursor: help;
}

/* Hide VitePress chrome */
.demo-page :deep(.VPNav),
.demo-page :deep(.VPNavBar),
.demo-page :deep(.VPSidebar),
.demo-page :deep(.VPFooter),
.demo-page :deep(.VPLocalNav) {
  display: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .demo-page__main {
    padding: 1rem 0.75rem;
    align-items: flex-start;
  }

  .demo-page__footer {
    padding: 0.75rem 1rem;
  }

  .demo-page__link {
    font-size: 0.72rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>
