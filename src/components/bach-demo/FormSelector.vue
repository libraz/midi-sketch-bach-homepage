<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { FORM_CATEGORIES, type FormCategory } from '@/data/bachDemoOptions'
import { getFormsByCategory, type FormPreset } from '@/data/formPresets'

const props = defineProps<{
  activeCategory: FormCategory
  selectedForm: number
  t: (key: string, params?: Record<string, string>) => string
}>()

const emit = defineEmits<{
  'update:activeCategory': [category: FormCategory]
  select: [formId: number]
}>()

const filteredForms = computed<FormPreset[]>(() => getFormsByCategory(props.activeCategory))
const formCardsRef = ref<HTMLElement | null>(null)

let scrollRafId: number | null = null

function scrollToSelected() {
  const container = formCardsRef.value
  if (!container) return
  const scrollContainer = container
  const selected = scrollContainer.querySelector('.form-card--selected') as HTMLElement | null
  if (!selected) return

  const containerRect = scrollContainer.getBoundingClientRect()
  const target = selected.offsetLeft - scrollContainer.offsetLeft
    - (containerRect.width / 2) + (selected.offsetWidth / 2)

  if (scrollRafId !== null) cancelAnimationFrame(scrollRafId)

  const start = scrollContainer.scrollLeft
  const delta = target - start
  if (Math.abs(delta) < 1) return

  const duration = 400
  let startTime: number | null = null
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  function step(now: number) {
    if (startTime === null) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      scrollContainer.scrollLeft = start + delta * easeOutCubic(progress)
    if (progress < 1) {
      scrollRafId = requestAnimationFrame(step)
    } else {
      scrollRafId = null
    }
  }

  scrollRafId = requestAnimationFrame(step)
}

watch(
  () => [props.activeCategory, props.selectedForm],
  () => {
    nextTick(() => scrollToSelected())
  },
)

onUnmounted(() => {
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId)
  }
})
</script>

<template>
  <section class="bach-demo__forms">
    <div class="category-tabs">
      <button
        v-for="cat in FORM_CATEGORIES"
        :key="cat.id"
        class="category-tab"
        :class="{ 'category-tab--active': activeCategory === cat.id }"
        @click="emit('update:activeCategory', cat.id)"
      >
        {{ t(cat.labelKey) }}
      </button>
    </div>
    <div ref="formCardsRef" class="form-cards">
      <button
        v-for="form in filteredForms"
        :key="form.id"
        class="form-card"
        :class="{ 'form-card--selected': selectedForm === form.id }"
        @click="emit('select', form.id)"
      >
        <span class="form-card__name">{{ t(form.displayKey) }}</span>
        <span class="form-card__bwv">{{ t('form.bwvRef', { bwv: form.bwv }) }}</span>
        <span class="form-card__desc">{{ t(form.descKey) }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.bach-demo__forms {
  width: 100%;
}

.category-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.category-tab {
  flex: 1;
  padding: 0.55rem 1rem;
  border: 1px solid rgba(100, 120, 170, 0.1);
  border-radius: 6px;
  background: rgba(26, 26, 34, 0.4);
  color: rgba(228, 224, 218, 0.4);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.category-tab:hover {
  background: rgba(26, 26, 34, 0.6);
  color: rgba(228, 224, 218, 0.6);
}

.category-tab--active {
  background: rgba(212, 166, 62, 0.06);
  border-color: rgba(212, 166, 62, 0.28);
  color: #D4B86A;
}

.form-cards {
  display: flex;
  gap: 0.35rem;
  padding: 0.25rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 120, 170, 0.12) transparent;
  -webkit-overflow-scrolling: touch;
}

.form-cards::-webkit-scrollbar {
  height: 3px;
}

.form-cards::-webkit-scrollbar-track {
  background: transparent;
}

.form-cards::-webkit-scrollbar-thumb {
  background: rgba(100, 120, 170, 0.12);
  border-radius: 3px;
}

.form-card {
  flex: 0 0 130px;
  position: relative;
  padding: 0.55rem 0.5rem;
  border: 1px solid rgba(100, 120, 170, 0.08);
  border-radius: 4px;
  background: rgba(26, 26, 34, 0.5);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: center;
  transition: all 0.25s ease;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: rgba(100, 120, 170, 0.06);
  clip-path: polygon(0% 100%, 50% 0%, 100% 100%);
  transition: all 0.25s ease;
}

.form-card:hover {
  border-color: rgba(100, 120, 170, 0.22);
  background: rgba(26, 26, 34, 0.7);
  transform: translateY(-1px);
}

.form-card:hover::before {
  background: rgba(100, 120, 170, 0.15);
  height: 4px;
}

/* Selected — lit from within, like a candle behind stained glass */
.form-card--selected {
  border-color: rgba(212, 166, 62, 0.38);
  background: rgba(212, 166, 62, 0.045);
  box-shadow:
    0 0 14px rgba(212, 166, 62, 0.08),
    inset 0 0 22px rgba(212, 166, 62, 0.03);
}

.form-card--selected:hover {
  border-color: rgba(212, 166, 62, 0.5);
  background: rgba(212, 166, 62, 0.06);
}

.form-card--selected::before {
  background: linear-gradient(to right, rgba(155, 35, 53, 0.55), rgba(212, 166, 62, 0.75), rgba(155, 35, 53, 0.55));
  width: 80%;
  height: 4px;
}

.form-card__name {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  color: #E4E0DA;
  line-height: 1.3;
}

.form-card--selected .form-card__name {
  color: #DCC68E;
}

.form-card__bwv {
  font-family: 'JetBrains Mono', 'DM Mono', monospace;
  font-size: 0.58rem;
  font-weight: 400;
  color: rgba(100, 120, 170, 0.4);
  letter-spacing: 0.06em;
}

.form-card--selected .form-card__bwv {
  color: rgba(212, 166, 62, 0.6);
}

.form-card__desc {
  font-size: 0.64rem;
  color: rgba(228, 224, 218, 0.42);
  line-height: 1.35;
}

@media (max-width: 768px) {
  .form-card {
    flex: 0 0 110px;
  }

  .form-card__name {
    font-size: 0.68rem;
  }

  .form-card__desc {
    display: none;
  }
}
</style>
