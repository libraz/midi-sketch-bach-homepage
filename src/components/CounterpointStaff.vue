<template>
  <figure class="counterpoint-staff" :data-status="status" :data-verdict="verdict">
    <div class="counterpoint-staff__header">
      <span class="counterpoint-staff__badge" :data-verdict="verdict">
        <span v-if="verdictIcon" class="counterpoint-staff__badge-icon" aria-hidden="true">{{ verdictIcon }}</span>
        {{ view.badge }}
      </span>
      <strong>{{ view.title }}</strong>
      <span v-if="view.sequentialHint" class="counterpoint-staff__seq">{{ view.sequentialHint }}</span>
      <button
        class="counterpoint-staff__play"
        type="button"
        :aria-label="playingId === example ? view.stopLabel : view.playLabel"
        :title="playingId === example ? view.stopLabel : view.playLabel"
        :data-playing="playingId === example"
        :disabled="isLoading"
        @click="togglePlay"
      >
        <svg v-if="playingId !== example" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 2.5v11l9-5.5z" />
        </svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3.5" y="3.5" width="9" height="9" rx="1" />
        </svg>
      </button>
    </div>
    <div class="counterpoint-staff__score" role="img" :aria-label="view.title">
      <div
        v-if="status !== 'ready'"
        class="counterpoint-staff__static"
        v-html="staticScoreSvg"
      />
      <div
        ref="target"
        class="counterpoint-staff__renderer"
        :aria-hidden="status !== 'ready'"
      />
    </div>
    <figcaption>{{ view.caption }}</figcaption>
    <div class="counterpoint-staff__diagnosis">
      <span
        v-for="ruleId in view.ruleIds"
        :key="ruleId"
        class="counterpoint-staff__rule"
      >
        {{ ruleId }}
      </span>
      <span>{{ view.diagnosis }}</span>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { IssueMark, StaffExampleDef, StaffLocale, StaffNote } from '@/data/staffExamples'
import { beatsPerBar, durationBeats, exampleVerdict, getStaffExample, verdictColor } from '@/data/staffExamples'
import { useStaffPlayer, type VoicePart } from '@/composables/useStaffPlayer'

type Status = 'loading' | 'ready' | 'error'
type Clef = 'treble' | 'bass'

const props = withDefaults(defineProps<{
  example: string
  locale?: StaffLocale
}>(), {
  locale: 'en',
})

const target = ref<HTMLDivElement | null>(null)
const status = ref<Status>('loading')
const { play, isLoading, playingId, playbackState, audioNow } = useStaffPlayer()

const uiCopy: Record<StaffLocale, { upper: string; middle: string; lower: string; play: string; stop: string; sequential: string }> = {
  en: { upper: 'upper', middle: 'middle', lower: 'lower', play: 'Play this example', stop: 'Stop playback', sequential: 'voices play in turn' },
  ja: { upper: '上声', middle: '中声', lower: '下声', play: 'この譜例を再生', stop: '再生を停止', sequential: '声部を順に再生' },
}

const def = computed<StaffExampleDef>(() => {
  const found = getStaffExample(props.example)
  if (found) return found
  // Unknown id: fall back to the canonical first example so the page
  // still renders, and make the mistake visible in the console.
  console.warn(`[CounterpointStaff] unknown example id: ${props.example}`)
  return getStaffExample('parallelFifths')!
})

/** Ordered list of the staves this example renders. */
interface PartDef {
  part: VoicePart
  notes: StaffNote[]
  clef: Clef
  label: string
}

const view = computed(() => {
  const locale: StaffLocale = props.locale === 'ja' ? 'ja' : 'en'
  const d = def.value
  const ui = uiCopy[locale]
  const parts: PartDef[] = [
    { part: 'upper', notes: d.upper, clef: d.upperClef, label: d.upperLabel?.[locale] ?? ui.upper },
  ]
  if (d.middle) {
    parts.push({ part: 'middle', notes: d.middle, clef: d.middleClef ?? 'treble', label: d.middleLabel?.[locale] ?? ui.middle })
  }
  parts.push({ part: 'lower', notes: d.lower, clef: d.lowerClef, label: d.lowerLabel?.[locale] ?? ui.lower })
  return {
    badge: d.badge[locale],
    title: d.title[locale],
    caption: d.caption[locale],
    diagnosis: d.diagnosis[locale],
    ruleIds: d.ruleIds,
    parts,
    playLabel: ui.play,
    stopLabel: ui.stop,
    sequentialHint: d.playback === 'sequential' ? ui.sequential : '',
  }
})

const verdict = computed(() => exampleVerdict(def.value))
/** Default color for overlay marks and issue rings without an explicit color. */
const markColor = computed(() => verdictColor(verdict.value))
const verdictIcon = computed(() => {
  switch (verdict.value) {
    case 'bad': return '✕'
    case 'good': return '✓'
    case 'caution': return '!'
    default: return ''
  }
})

const staveCount = computed(() => view.value.parts.length)
const height = computed(() => staveCount.value === 3 ? 335 : 235)

async function togglePlay() {
  try {
    await play(props.example, def.value)
  } catch (error) {
    console.error('[CounterpointStaff] playback failed', error)
  }
}

/** Cumulative start beat for every note of a voice. */
function startBeats(notes: StaffNote[]): number[] {
  const out: number[] = []
  let beat = 0
  for (const note of notes) {
    out.push(beat)
    beat += durationBeats(note.duration)
  }
  return out
}

function escapeHtml(value: string): string {
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

/** Per-part position accessors used by the shared overlay builder. */
interface PartPositions {
  x: (index: number) => number
  y: (index: number) => number
}
type Positions = Partial<Record<VoicePart, PartPositions>>

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
 * SVG fragment. All content comes from the trusted local example registry
 * and every label passes through escapeHtml. Works for both the static
 * fallback and the VexFlow render because all coordinates come from the
 * position accessors.
 */
function overlaySvg(issues: IssueMark[], pos: Positions, svgHeight: number, defaultColor: string): string {
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

// --- Static SVG fallback (shown until VexFlow hydrates) -------------------

const STATIC_LEFT = 78
/** Static-fallback stave tops: 46/146 for two staves, 46/146/246 for three. */
function staticTops(count: number): number[] {
  return count === 3 ? [46, 146, 246] : [46, 146]
}

function pitchY(key: string, clef: Clef, staffTop: number): number {
  const [name, octaveText] = key.split('/')
  const octave = Number(octaveText)
  const stepMap: Record<string, number> = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 }
  const step = (stepMap[name?.[0]?.toLowerCase()] ?? 0) + octave * 7
  const baseStep = clef === 'bass' ? stepMap.g + 2 * 7 : stepMap.e + 4 * 7
  return staffTop + 40 - (step - baseStep) * 5
}

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

const staticScoreSvg = computed(() => {
  const d = def.value
  const parts = view.value.parts
  const tops = staticTops(parts.length)
  const svgHeight = height.value
  const width = d.width
  const right = width - 40
  const bars = d.bars ?? 1
  const totalBeatCount = beatsPerBar(d.time) * bars
  const startX = 170
  const beatWidth = (right - startX - 20) / totalBeatCount
  const beatX = (beat: number, beats: number) => startX + (beat + Math.min(beats, 1) / 2) * beatWidth

  const partStarts = parts.map((p) => startBeats(p.notes))
  const positions: Positions = {}
  parts.forEach((p, pi) => {
    positions[p.part] = {
      x: (i) => beatX(partStarts[pi][i] ?? 0, durationBeats(p.notes[i]?.duration)),
      y: (i) => pitchY(p.notes[i]?.key ?? 'c/4', p.clef, tops[pi]),
    }
  })

  const staffLines = (top: number) => [0, 1, 2, 3, 4]
    .map((line) => `<line x1="${STATIC_LEFT}" y1="${top + line * 10}" x2="${right}" y2="${top + line * 10}" />`)
    .join('')

  const barlineX: number[] = [STATIC_LEFT, right]
  for (let bar = 1; bar < bars; bar++) {
    barlineX.push(startX + bar * beatsPerBar(d.time) * beatWidth - beatWidth * 0.25)
  }
  const barlines = barlineX.map((x) => tops
    .map((top) => `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + 40}" />`)
    .join('')).join('')

  const noteGroup = (p: PartDef, pi: number) => p.notes
    .map((note, index) => staticNoteSvg(note, beatX(partStarts[pi][index], durationBeats(note.duration)), pitchY(note.key, p.clef, tops[pi]), markColor.value))
    .join('')

  // Tie arcs between a tied note and its successor.
  const tieGroup = (p: PartDef, pi: number) => p.notes
    .map((note, index) => {
      if (!note.tie || !p.notes[index + 1]) return ''
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
  const bottomTop = tops[tops.length - 1]

  return `
    <svg
      data-source="static-staff"
      viewBox="0 0 ${width} ${svgHeight}"
      width="${width}"
      height="${svgHeight}"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="${width}" height="${svgHeight}" fill="#fff" />
      <g class="counterpoint-staff__svg-staff" stroke="#111827" stroke-width="1">
        ${tops.map(staffLines).join('')}
        ${barlines}
        <path d="M61 ${tops[0] - 2} C43 ${tops[0] + 22}, 43 ${bottomTop + 18}, 61 ${bottomTop + 42}" fill="none" stroke-width="2.2" />
      </g>
      ${partLabels}
      ${timeLabels}
      ${parts.map((p, pi) => `<g>${noteGroup(p, pi)}${tieGroup(p, pi)}</g>`).join('')}
      <g>${overlaySvg(d.issues ?? [], positions, svgHeight, markColor.value)}</g>
    </svg>
  `
})

// --- VexFlow render --------------------------------------------------------

/** Rendered note centers per part, for the playback highlight. */
let renderedPositions: Partial<Record<VoicePart, Array<{ x: number; y: number }>>> = {}
let highlightCircles: Partial<Record<VoicePart, SVGCircleElement>> = {}
let rafId = 0

async function render() {
  if (!target.value) return
  status.value = 'loading'
  target.value.innerHTML = ''
  renderedPositions = {}
  highlightCircles = {}

  try {
    const VF = await import('vexflow')
    // VexFlow 5 draws glyphs as <text> in the Bravura font and measures
    // their widths through canvas. Importing the module only *starts*
    // loading its fonts; rendering before they finish measures notehead
    // widths with the fallback font, which pushes up-stems off the
    // noteheads. Wait for the faces the score uses before any layout.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await Promise.all([
        document.fonts.load('30pt Bravura'),
        document.fonts.load('30pt Academico'),
      ]).catch(() => undefined)
    }
    const d = def.value
    const parts = view.value.parts
    const bars = d.bars ?? 1
    const perBar = beatsPerBar(d.time)
    const totalBeatCount = perBar * bars
    const svgHeight = height.value

    const renderer = new VF.Renderer(target.value, VF.Renderer.Backends.SVG)
    renderer.resize(d.width, svgHeight)
    const context = renderer.getContext()
    context.setFont('Arial', 10)

    const staveWidth = d.width - 120
    const staves = parts.map((p, pi) => {
      const stave = new VF.Stave(STATIC_LEFT, 24 + pi * 100, staveWidth)
      stave.addClef(p.clef)
      if (d.keySignature) stave.addKeySignature(d.keySignature)
      stave.addTimeSignature(d.time)
      stave.setContext(context).draw()
      return stave
    })

    const connector = new VF.StaveConnector(staves[0], staves[staves.length - 1])
    connector.setType(VF.StaveConnector.type.BRACE)
    connector.setContext(context).draw()

    const makeNote = (item: StaffNote, clef: Clef) => {
      const duration = (item.duration ?? 'q') + (item.rest ? 'r' : '')
      const staveNote = new VF.StaveNote({ clef, keys: [item.key], duration })
      if (!item.rest && item.accidental) {
        staveNote.addModifier(new VF.Accidental(item.accidental))
      }
      if (item.color) {
        staveNote.setStyle({ fillStyle: item.color, strokeStyle: item.color })
      }
      if (item.annotation) {
        const annotation = new VF.Annotation(item.annotation)
          .setFont('Arial', 11)
          .setVerticalJustification(VF.Annotation.VerticalJustify.TOP)
        staveNote.addModifier(annotation)
      }
      return staveNote
    }

    /** Build tickables with barlines inserted at bar boundaries. */
    const buildTickables = (notes: StaffNote[], clef: Clef) => {
      const staveNotes: InstanceType<typeof VF.StaveNote>[] = []
      const tickables: InstanceType<typeof VF.Note>[] = []
      let beat = 0
      for (const item of notes) {
        if (beat > 0 && beat % perBar === 0) {
          tickables.push(new VF.BarNote())
        }
        const note = makeNote(item, clef)
        staveNotes.push(note)
        tickables.push(note)
        beat += durationBeats(item.duration)
      }
      return { staveNotes, tickables }
    }

    const built = parts.map((p) => buildTickables(p.notes, p.clef))
    const voices = built.map((b) => {
      const voice = new VF.Voice({ numBeats: totalBeatCount, beatValue: 4 })
      voice.setMode(VF.VoiceMode.SOFT).addTickables(b.tickables)
      return voice
    })

    const formatter = new VF.Formatter()
    voices.forEach((voice) => formatter.joinVoices([voice]))
    formatter.format(voices, staveWidth - 80)

    const beams = built.map((b) => VF.Beam.generateBeams(b.staveNotes.filter((n) => !n.isRest())))

    voices.forEach((voice, pi) => voice.draw(context, staves[pi]))
    beams.forEach((set) => set.forEach((beam) => beam.setContext(context).draw()))

    // Ties between a tied note and its successor on the same stave.
    parts.forEach((p, pi) => {
      p.notes.forEach((item, i) => {
        const first = built[pi].staveNotes[i]
        const last = built[pi].staveNotes[i + 1]
        if (!item.tie || !first || !last || item.rest) return
        const tie = new VF.StaveTie({ firstNote: first, lastNote: last, firstIndexes: [0], lastIndexes: [0] })
        tie.setContext(context).draw()
      })
    })

    // Overlay the stave labels and issue marks using the real rendered
    // note positions. The markup is generated from the trusted local
    // example registry and escaped.
    const svg = target.value.querySelector('svg')
    if (svg) {
      // VexFlow sets fixed pixel width/height only. Add a viewBox (and drop
      // any inline size) so CSS can scale the score down to the container
      // width instead of clipping it.
      svg.setAttribute('viewBox', `0 0 ${d.width} ${svgHeight}`)
      svg.style.width = ''
      svg.style.height = ''
      const noteX = (notes: InstanceType<typeof VF.StaveNote>[], i: number) => {
        const note = notes[Math.min(i, notes.length - 1)]
        return note ? note.getAbsoluteX() + 5 : 0
      }
      const noteY = (notes: InstanceType<typeof VF.StaveNote>[], i: number) => {
        const note = notes[Math.min(i, notes.length - 1)]
        return note ? note.getYs()[0] : 0
      }
      const positions: Positions = {}
      parts.forEach((p, pi) => {
        positions[p.part] = {
          x: (i) => noteX(built[pi].staveNotes, i),
          y: (i) => noteY(built[pi].staveNotes, i),
        }
        renderedPositions[p.part] = p.notes.map((_, i) => ({
          x: noteX(built[pi].staveNotes, i),
          y: noteY(built[pi].staveNotes, i),
        }))
      })
      const staveLabels = parts
        .map((p, pi) => `<text x="6" y="${staves[pi].getYForLine(2) + 4}" class="counterpoint-staff__svg-clef">${escapeHtml(p.label)}</text>`)
        .join('')
      // Dashed ring around every note flagged `issue` — the static
      // fallback draws the same ring, so the problem note stays marked
      // after VexFlow hydrates.
      const issueRings = parts
        .map((p, pi) => p.notes
          .map((note, i) => note.issue && !note.rest
            ? `<circle cx="${noteX(built[pi].staveNotes, i)}" cy="${noteY(built[pi].staveNotes, i)}" r="15" class="counterpoint-staff__svg-issue-ring" style="stroke: ${note.color ?? markColor.value}" />`
            : '')
          .join(''))
        .join('')
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('class', 'counterpoint-staff__overlay')
      group.innerHTML = staveLabels + issueRings + overlaySvg(d.issues ?? [], positions, svgHeight, markColor.value)
      svg.appendChild(group)

      // One hidden highlight circle per part; the playback loop moves it
      // to whichever note is sounding.
      const playheads = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      playheads.setAttribute('class', 'counterpoint-staff__playheads')
      parts.forEach((p) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('r', '15')
        circle.setAttribute('class', 'counterpoint-staff__playhead')
        circle.style.visibility = 'hidden'
        playheads.appendChild(circle)
        highlightCircles[p.part] = circle
      })
      svg.appendChild(playheads)
    }

    status.value = 'ready'
  } catch (error) {
    console.error(error)
    status.value = 'error'
  }
}

// --- Playback highlight ----------------------------------------------------

function hideHighlights() {
  for (const circle of Object.values(highlightCircles)) {
    if (circle) circle.style.visibility = 'hidden'
  }
}

function highlightTick() {
  const state = playbackState.value
  if (!state || state.id !== props.example) {
    hideHighlights()
    rafId = 0
    return
  }
  const t = audioNow() - state.startTime
  for (const part of ['upper', 'middle', 'lower'] as const) {
    const circle = highlightCircles[part]
    if (!circle) continue
    const windows = state.windows
    let active: { x: number; y: number } | null = null
    for (const w of windows) {
      if (w.part === part && w.start <= t && t < w.end) {
        active = renderedPositions[part]?.[w.index] ?? null
        break
      }
    }
    if (active) {
      circle.setAttribute('cx', String(active.x))
      circle.setAttribute('cy', String(active.y))
      circle.style.visibility = 'visible'
    } else {
      circle.style.visibility = 'hidden'
    }
  }
  rafId = requestAnimationFrame(highlightTick)
}

watch(playbackState, (state) => {
  if (state && state.id === props.example) {
    if (!rafId) rafId = requestAnimationFrame(highlightTick)
  } else {
    hideHighlights()
  }
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
})

onMounted(render)
watch(() => [props.example, props.locale], render)
</script>
