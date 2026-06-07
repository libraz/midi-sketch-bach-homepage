/**
 * Issue-overlay rendering for a counterpoint staff example: the boxes,
 * arrows, rings, brackets and labels that explain a diagnosis on the score.
 *
 * Every coordinate comes from the caller's position accessors, so the same
 * builder serves both the static SVG fallback and the hydrated VexFlow
 * render. All content originates in the trusted local example registry and
 * every label passes through escapeHtml.
 */
import type { IssueMark } from '@/data/staffExamples'
import type { VoicePart } from '@/composables/useStaffPlayer'
import type { Positions } from './layout'
import { escapeHtml } from './inlineMarkdown'

function arrowSvg(x1: number, y1: number, x2: number, y2: number, color: string): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const size = 7
  const leftX = x2 - size * Math.cos(angle - Math.PI / 6)
  const leftY = y2 - size * Math.sin(angle - Math.PI / 6)
  const rightX = x2 - size * Math.cos(angle + Math.PI / 6)
  const rightY = y2 - size * Math.sin(angle + Math.PI / 6)
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" />
    <path d="M${x2} ${y2} L${leftX} ${leftY} M${x2} ${y2} L${rightX} ${rightY}" stroke="${color}" stroke-width="2" fill="none" />
  `
}

/** The (part, index) pairs a vertical/note mark points at. */
function markPoints(issue: IssueMark, pos: Positions): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  if (issue.upperIndex != null && pos.upper) points.push({ x: pos.upper.x(issue.upperIndex), y: pos.upper.y(issue.upperIndex) })
  if (issue.middleIndex != null && pos.middle) points.push({ x: pos.middle.x(issue.middleIndex), y: pos.middle.y(issue.middleIndex) })
  if (issue.lowerIndex != null && pos.lower) points.push({ x: pos.lower.x(issue.lowerIndex), y: pos.lower.y(issue.lowerIndex) })
  return points
}

/**
 * Render the issue overlay (boxes, arrows, rings, brackets, labels) as an
 * SVG fragment. Works for both the static fallback and the VexFlow render
 * because all coordinates come from the position accessors.
 */
export function overlaySvg(issues: IssueMark[], pos: Positions, svgHeight: number, defaultColor: string): string {
  let labelSlot = 0
  const motionSegments: Array<[VoicePart, number | undefined, number | undefined, number]> = []
  return issues.map((issue) => {
    const color = issue.color ?? defaultColor
    const anchor =
      issue.upperIndex != null || issue.toUpper != null
        ? pos.upper?.x(issue.upperIndex ?? issue.toUpper ?? 0)
        : issue.middleIndex != null || issue.toMiddle != null
          ? pos.middle?.x(issue.middleIndex ?? issue.toMiddle ?? 0)
          : pos.lower?.x(issue.lowerIndex ?? issue.toLower ?? 0)
    const anchorX = anchor ?? 0
    const labelY = 12 + (labelSlot++ % 3) * 13
    const makeLabel = (x: number) =>
      `<text x="${x}" y="${labelY}" text-anchor="middle" class="counterpoint-staff__svg-issue-label" style="fill: ${color}">${escapeHtml(issue.label)}</text>`
    const label = makeLabel(anchorX)

    if (issue.kind === 'vertical') {
      const points = markPoints(issue, pos)
      if (points.length >= 2) {
        const x = points[0].x
        const ys = points.map((p) => p.y)
        const top = Math.min(...ys) - 22
        const heightBox = Math.max(...ys) - Math.min(...ys) + 44
        const rings = points
          .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="14" class="counterpoint-staff__svg-issue-ring" style="stroke: ${color}" />`)
          .join('')
        return `
          ${label}
          <rect x="${x - 24}" y="${top}" width="48" height="${heightBox}" rx="8" class="counterpoint-staff__svg-issue-box" style="stroke: ${color}" />
          ${rings}
        `
      }
    }
    if (issue.kind === 'motion') {
      motionSegments.length = 0
      motionSegments.push(
        ['upper', issue.fromUpper, issue.toUpper, -8],
        ['middle', issue.fromMiddle, issue.toMiddle, -8],
        ['lower', issue.fromLower, issue.toLower, 16],
      )
      const arrows = motionSegments
        .map(([part, from, to, dy]) => {
          const p = pos[part]
          if (from == null || to == null || !p) return ''
          return arrowSvg(p.x(from) + 18, p.y(from) + dy, p.x(to) - 18, p.y(to) + dy, color)
        })
        .join('')
      return `${label}${arrows}`
    }
    if (issue.kind === 'note') {
      const points = markPoints(issue, pos)
      if (points.length > 0) {
        const rings = points
          .map((p) => `<circle cx="${p.x}" cy="${p.y}" r="18" class="counterpoint-staff__svg-issue-ring" style="stroke: ${color}" />`)
          .join('')
        return `${label}${rings}`
      }
    }
    if (issue.kind === 'bracket') {
      const part: VoicePart = issue.fromUpper != null ? 'upper' : issue.fromMiddle != null ? 'middle' : 'lower'
      const p = pos[part]
      if (!p) return label
      const from = issue.fromUpper ?? issue.fromMiddle ?? issue.fromLower ?? 0
      const to = issue.toUpper ?? issue.toMiddle ?? issue.toLower ?? from
      const x1 = p.x(from)
      const x2 = p.x(to)
      let maxY = 0
      for (let i = from; i <= to; i++) {
        maxY = Math.max(maxY, p.y(i))
      }
      const y = Math.min(maxY + 26, svgHeight - 16)
      // Anchor the bracket label at the midpoint so it never clips at the edges.
      return `${makeLabel((x1 + x2) / 2)}<path d="M${x1} ${y} C${x1 + 30} ${y + 10}, ${x2 - 30} ${y + 10}, ${x2} ${y}" class="counterpoint-staff__svg-bracket" style="stroke: ${color}" />`
    }
    return label
  }).join('')
}
