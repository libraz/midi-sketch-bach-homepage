<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  notice?: string
}>()
</script>

<template>
  <header class="bach-demo__header">
    <div class="header-ornament">
      <span class="header-ornament__line"></span>
      <span class="header-ornament__trefoil"></span>
      <span class="header-ornament__line"></span>
    </div>
    <h1 class="bach-demo__title">{{ title }}</h1>
    <p class="bach-demo__subtitle">{{ subtitle }}</p>
    <p v-if="notice" class="bach-demo__notice">{{ notice }}</p>
  </header>
</template>

<style scoped>
.bach-demo__header {
  text-align: center;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Staggered entrance — ornament draws first, then title, subtitle, notice */
.header-ornament,
.bach-demo__title,
.bach-demo__subtitle,
.bach-demo__notice {
  animation: header-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.header-ornament { animation-delay: 0.05s; }
.bach-demo__title { animation-delay: 0.15s; }
.bach-demo__subtitle { animation-delay: 0.3s; }
.bach-demo__notice { animation-delay: 0.42s; }

@keyframes header-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-ornament {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.3rem;
}

.header-ornament__line {
  transform-origin: center;
  animation: ornament-draw 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

@keyframes ornament-draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.header-ornament__line {
  width: 36px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(100, 120, 170, 0.3));
}

.header-ornament__line:last-child {
  background: linear-gradient(90deg, rgba(100, 120, 170, 0.3), transparent);
}

.header-ornament__trefoil {
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  animation: breathe-trefoil 5s ease-in-out infinite;
}

.header-ornament__trefoil::before,
.header-ornament__trefoil::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(100, 120, 170, 0.5);
}

.header-ornament__trefoil::before {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.header-ornament__trefoil::after {
  bottom: 0;
  left: 0;
  box-shadow: 8px 0 0 -1px rgba(7, 8, 13, 0), 8px 0 0 0 rgba(100, 120, 170, 0.5);
}

@keyframes breathe-trefoil {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.bach-demo__title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.4rem;
  font-weight: 300;
  letter-spacing: 0.2em;
  margin: 0;
  color: #E4E0DA;
  line-height: 1.2;
  /* Ivory fading into old gold at the descenders — candlelit stone lettering */
  background: linear-gradient(180deg, #F2EEE6 0%, #E4E0DA 52%, #C0AC7E 125%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 28px rgba(212, 166, 62, 0.08);
}

.bach-demo__subtitle {
  margin: 0;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.68rem;
  color: rgba(228, 224, 218, 0.6);
  letter-spacing: 0.16em;
  font-weight: 500;
  text-transform: uppercase;
}

.bach-demo__notice {
  margin: -0.15rem 0 0;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.6rem;
  color: rgba(228, 224, 218, 0.55);
  letter-spacing: 0.02em;
  font-weight: 400;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .bach-demo__title {
    font-size: 1.7rem;
    letter-spacing: 0.14em;
  }

  .bach-demo__subtitle {
    font-size: 0.6rem;
  }

  .header-ornament__line {
    width: 24px;
  }
}
</style>
