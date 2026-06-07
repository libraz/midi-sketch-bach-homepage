/**
 * Minimal inline-markdown rendering for the counterpoint staff example
 * registry. The registry text is plain prose with `code` spans and
 * *emphasis* only; everything is escaped first so the rendered HTML
 * contains nothing but the markup these helpers insert.
 */

/** Escape the HTML special characters in registry text. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[char] ?? char
  })
}

/**
 * Render the minimal inline markdown the example registry uses — `code`
 * spans and *emphasis* — into HTML. The text is escaped first, so the only
 * markup in the output is what this function inserts.
 */
export function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>')
}
