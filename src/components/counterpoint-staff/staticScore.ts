/**
 * Static SVG fallback for a counterpoint staff example, shown until VexFlow
 * hydrates. It engraves the staves, notes, ties and the issue overlay from
 * the same beat geometry the VexFlow renderer uses, so the fallback and the
 * hydrated score align. All text passes through escapeHtml.
 */
import type { StaffExampleDef, StaffNote } from '@/data/staffExamples'
import { beatsPerBar, durationBeats } from '@/data/staffExamples'
import {
  type PartDef,
  type Positions,
  STATIC_LEFT,
  pitchY,
  staffHeight,
  startBeats,
  staticTops,
  systemCount,
  systemStride,
} from './layout'
import { escapeHtml } from './inlineMarkdown'
import { overlaySvg } from './overlaySvg'

function staticNoteSvg(note: StaffNote, x: number, y: number, ringColor: string): string {
  const color = note.color ?? '#111827'
  const label = note.annotation
    ? `<text x="${x}" y="${Math.max(14, y - 22)}" text-anchor="middle" class="counterpoint-staff__svg-label" fill="${color}">${escapeHtml(note.annotation)}</text>`
    : ''
  if (note.rest) {
    return `${label}<rect x="${x - 7}" y="${y - 3}" width="14" height="6" rx="1" fill="${color}" opacity="0.7" />`
  }
  const issueRing = note.issue
    ? `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${note.color ?? ringColor}" stroke-width="2" stroke-dasharray="3 3" />`
    : ''
  const beats = durationBeats(note.duration)
  const accidental = note.accidental
    ? `<text x="${x - 16}" y="${y + 5}" text-anchor="middle" class="counterpoint-staff__svg-label" fill="${color}">${note.accidental === '#' ? '♯' : note.accidental === 'b' ? '♭' : '♮'}</text>`
    : ''
  const head = beats >= 2
    ? `<ellipse cx="${x}" cy="${y}" rx="8.8" ry="6.2" transform="rotate(-18 ${x} ${y})" fill="none" stroke="${color}" stroke-width="2.4" />`
    : `<ellipse cx="${x}" cy="${y}" rx="8.8" ry="6.2" transform="rotate(-18 ${x} ${y})" fill="${color}" />`
  return `${label}${issueRing}${accidental}${head}`
}

/** Build the static-fallback SVG for an example resolved to its parts. */
export function buildStaticScoreSvg(d: StaffExampleDef, parts: PartDef[], markColor: string): string {
  const tops = staticTops(parts.length)
  const bars = d.bars ?? 1
  const perBar = beatsPerBar(d.time)
  const systems = systemCount(bars, d.systemBars)
  const stride = systemStride(parts.length)
  const svgHeight = staffHeight(parts.length, systems)
  const width = d.width
  const right = width - 40
  const beatsPerSystem = (d.systemBars ?? bars) * perBar
  const startX = 170
  const beatWidth = (right - startX - 20) / beatsPerSystem

  const partStarts = parts.map((p) => startBeats(p.notes))
  const systemOf = (beat: number) => Math.min(Math.floor(beat / beatsPerSystem + 1e-6), systems - 1)
  const beatX = (beat: number, beats: number) =>
    startX + (beat - systemOf(beat) * beatsPerSystem + Math.min(beats, 1) / 2) * beatWidth
  const positions: Positions = {}
  parts.forEach((p, pi) => {
    positions[p.part] = {
      x: (i) => beatX(partStarts[pi][i] ?? 0, durationBeats(p.notes[i]?.duration)),
      y: (i) => pitchY(p.notes[i]?.key ?? 'c/4', p.clef, tops[pi] + systemOf(partStarts[pi][i] ?? 0) * stride),
    }
  })

  const systemTops = Array.from({ length: systems }, (_, sys) => tops.map((top) => top + sys * stride))

  const staffLines = (top: number) => [0, 1, 2, 3, 4]
    .map((line) => `<line x1="${STATIC_LEFT}" y1="${top + line * 10}" x2="${right}" y2="${top + line * 10}" />`)
    .join('')

  const barlines = systemTops.map((rowTops, sys) => {
    const barlineX: number[] = [STATIC_LEFT, right]
    const barsInSystem = Math.min(d.systemBars ?? bars, bars - sys * (d.systemBars ?? bars))
    for (let bar = 1; bar < barsInSystem; bar++) {
      barlineX.push(startX + bar * perBar * beatWidth - beatWidth * 0.25)
    }
    return barlineX.map((x) => rowTops
      .map((top) => `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + 40}" />`)
      .join('')).join('')
  }).join('')

  const noteGroup = (p: PartDef, pi: number) => p.notes
    .map((note, index) => staticNoteSvg(
      note,
      positions[p.part]!.x(index),
      pitchY(note.key, p.clef, tops[pi] + systemOf(partStarts[pi][index]) * stride),
      markColor,
    ))
    .join('')

  // Tie arcs between a tied note and its successor (skipped across a system break).
  const tieGroup = (p: PartDef, pi: number) => p.notes
    .map((note, index) => {
      if (!note.tie || !p.notes[index + 1]) return ''
      if (systemOf(partStarts[pi][index]) !== systemOf(partStarts[pi][index + 1])) return ''
      const acc = positions[p.part]!
      const x1 = acc.x(index)
      const x2 = acc.x(index + 1)
      const y = acc.y(index)
      return `<path d="M${x1 + 10} ${y + 9} Q${(x1 + x2) / 2} ${y + 17} ${x2 - 10} ${y + 9}" fill="none" stroke="${note.color ?? '#111827'}" stroke-width="1.6" />`
    })
    .join('')

  const partLabels = parts
    .map((p, pi) => `<text x="20" y="${tops[pi] + 25}" class="counterpoint-staff__svg-clef">${escapeHtml(p.label)}</text>`)
    .join('')
  const timeLabels = tops
    .map((top) => `<text x="104" y="${top + 25}" class="counterpoint-staff__svg-time">${escapeHtml(d.time)}</text>`)
    .join('')
  const braces = systemTops.map((rowTops) => {
    const bottomTop = rowTops[rowTops.length - 1]
    return `<path d="M61 ${rowTops[0] - 2} C43 ${rowTops[0] + 22}, 43 ${bottomTop + 18}, 61 ${bottomTop + 42}" fill="none" stroke-width="2.2" />`
  }).join('')

  return `
    <svg
      data-source="static-staff"
      viewBox="0 0 ${width} ${svgHeight}"
      width="${width}"
      height="${svgHeight}"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g class="counterpoint-staff__svg-staff" stroke="#111827" stroke-width="1">
        ${systemTops.map((rowTops) => rowTops.map(staffLines).join('')).join('')}
        ${barlines}
        ${braces}
      </g>
      ${partLabels}
      ${timeLabels}
      ${parts.map((p, pi) => `<g>${noteGroup(p, pi)}${tieGroup(p, pi)}</g>`).join('')}
      <g>${overlaySvg(d.issues ?? [], positions, svgHeight, markColor)}</g>
    </svg>
  `
}
