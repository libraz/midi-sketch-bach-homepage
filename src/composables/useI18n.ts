import { useData } from 'vitepress'
import { computed } from 'vue'
import en from '@/locales/en.json'
import ja from '@/locales/ja.json'

type LocaleMessages = typeof en

const messages: Record<string, LocaleMessages> = { en, ja }

/** Walk a dotted key path through a message tree; null when it does not resolve to a string. */
function lookup(root: LocaleMessages, keys: string[]): string | null {
  let node: unknown = root
  for (const key of keys) {
    if (typeof node !== 'object' || node === null || !(key in node)) return null
    node = (node as Record<string, unknown>)[key]
  }
  return typeof node === 'string' ? node : null
}

export function useI18n() {
  const { lang } = useData()
  const locale = computed(() => lang.value || 'en')
  const currentMessages = computed(() => messages[locale.value] || messages.en)

  function t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.')
    // Fall back to English when the active locale has no entry for this key.
    const result = lookup(currentMessages.value, keys) ?? lookup(messages.en, keys)
    if (result === null) return key
    if (params) {
      return result.replace(/\{(\w+)\}/g, (_, paramKey) => params[paramKey] || `{${paramKey}}`)
    }
    return result
  }

  function isLocale(loc: string): boolean {
    return locale.value === loc
  }

  return { locale, t, isLocale, messages: currentMessages }
}
