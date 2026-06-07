/**
 * VexFlow engraving for a counterpoint staff example. Draws the staves,
 * notes, beams, ties and the issue overlay into a target element, then
 * returns the rendered note centers and the hidden playback-highlight marks
 * so the component can drive the playback animation.
 *
 * The markup added on top of VexFlow's SVG (stave labels, issue rings,
 * overlay) is generated from the trusted local example registry and escaped.
 */
import type { StaffExampleDef, StaffNote } from '@/data/staffExamples'
import { beatsPerBar, durationBeats } from '@/data/staffExamples'
import type { VoicePart } from '@/composables/useStaffPlayer'
import {
  type Clef,
  type PartDef,
  type Positions,
  STATIC_LEFT,
  splitIntoSystems,
  staffHeight,
  systemCount,
  systemStride,
} from './layout'
import { escapeHtml } from './inlineMarkdown'
import { overlaySvg } from './overlaySvg'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Fill an SVG container with an escaped fragment from the trusted local
 * registry. Isolated here so the trusted-markup boundary is in one place.
 */
function fillSvgGroup(group: SVGGElement, escapedFragment: string): void {
  // eslint-disable-next-line no-unsanitized/property -- fragment is built from the trusted local registry and escaped
  group.innerHTML = escapedFragment
}

/** Outcome of a render: note centers per part and the per-part highlight marks. */
export interface VexFlowRender {
  renderedPositions: Partial<Record<VoicePart, Array<{ x: number; y: number }>>>
  highlightMarks: Partial<Record<VoicePart, SVGGElement>>
}

/** Engrave an example into `target` and return its playback geometry. */
export async function renderVexFlow(
  target: HTMLDivElement,
  { def: d, parts, markColor }: { def: StaffExampleDef; parts: PartDef[]; markColor: string },
): Promise<VexFlowRender> {
  target.replaceChildren()
  const renderedPositions: Partial<Record<VoicePart, Array<{ x: number; y: number }>>> = {}
  const highlightMarks: Partial<Record<VoicePart, SVGGElement>> = {}

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
  const bars = d.bars ?? 1
  const perBar = beatsPerBar(d.time)
  const sysBars = d.systemBars ?? bars
  const systems = systemCount(bars, d.systemBars)
  const beatsPerSystem = sysBars * perBar
  const stride = systemStride(parts.length)
  const svgHeight = staffHeight(parts.length, systems)

  const makeNote = (item: StaffNote, clef: Clef) => {
    // A trailing "d" marks a dotted duration. The "d" must stay in the
    // duration string ("8d" / "hdr") so VexFlow extends the note's ticks
    // — Dot.buildAndAttach only draws the dot glyph and leaves ticks
    // unchanged, which would misalign every later note on the stave.
    const written = item.duration ?? 'q'
    const dotted = written.endsWith('d')
    const duration = written + (item.rest ? 'r' : '')
    const staveNote = new VF.StaveNote({ clef, keys: [item.key], duration })
    if (dotted) {
      VF.Dot.buildAndAttach([staveNote], { all: true })
    }
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

  // Per-system segmentation: built[sys][pi] holds that system row's notes.
  const segments = parts.map((p) => splitIntoSystems(p.notes, beatsPerSystem, systems))
  const built = Array.from({ length: systems }, (_, sys) =>
    parts.map((p, pi) => buildTickables(segments[pi][sys].notes, p.clef)))
  const sysVoices = built.map((row, sys) => {
    const barsInSystem = Math.min(sysBars, bars - sys * sysBars)
    return row.map((b) => {
      const voice = new VF.Voice({ numBeats: barsInSystem * perBar, beatValue: 4 })
      voice.setMode(VF.VoiceMode.SOFT).addTickables(b.tickables)
      return voice
    })
  })

  const formatters = sysVoices.map((voices) => {
    const formatter = new VF.Formatter()
    voices.forEach((voice) => formatter.joinVoices([voice]))
    return formatter
  })

  /** Locate a part's global note index inside its system segment. */
  const locate = (pi: number, i: number) => {
    for (let sys = 0; sys < systems; sys++) {
      const seg = segments[pi][sys]
      if (seg.notes.length && i >= seg.startIndex && i < seg.startIndex + seg.notes.length) {
        return { sys, note: built[sys][pi].staveNotes[i - seg.startIndex] }
      }
    }
    return null
  }

  // Size the figure before drawing anything: measure the left-modifier
  // block (clef + key signature + time signature) with probe staves and
  // the notes' minimum total width with the formatter. When a dense
  // example needs more room than its declared width, grow the figure —
  // the viewBox scaling shrinks it back to the container — instead of
  // letting notes run past the stave's right edge.
  const RIGHT_PAD = 24
  const modifierWidth = Math.max(...parts.map((p) => {
    const probe = new VF.Stave(0, 0, 200)
    probe.addClef(p.clef)
    if (d.keySignature) probe.addKeySignature(d.keySignature)
    probe.addTimeSignature(d.time)
    return probe.getNoteStartX() - probe.getX()
  }))
  const minNoteWidth = Math.max(...formatters.map((formatter, sys) => formatter.preCalculateMinTotalWidth(sysVoices[sys])))
  const staveWidth = Math.max(d.width - 120, Math.ceil(modifierWidth + minNoteWidth + RIGHT_PAD))
  const renderWidth = staveWidth + 120

  const renderer = new VF.Renderer(target, VF.Renderer.Backends.SVG)
  renderer.resize(renderWidth, svgHeight)
  const context = renderer.getContext()
  context.setFont('Arial', 10)

  const staves = built.map((row, sys) =>
    parts.map((p, pi) => {
      const stave = new VF.Stave(STATIC_LEFT, 24 + sys * stride + pi * 100, staveWidth)
      stave.addClef(p.clef)
      if (d.keySignature) stave.addKeySignature(d.keySignature)
      // Engraving convention: the time signature appears on the first system only.
      if (sys === 0) stave.addTimeSignature(d.time)
      stave.setContext(context).draw()
      return stave
    }))

  staves.forEach((row) => {
    const connector = new VF.StaveConnector(row[0], row[row.length - 1])
    connector.setType(VF.StaveConnector.type.BRACE)
    connector.setContext(context).draw()
  })

  // Format each system into the space actually left after its stave modifiers.
  formatters.forEach((formatter, sys) => {
    const noteAreaWidth = Math.min(...staves[sys].map((s) => s.getNoteEndX() - s.getNoteStartX()))
    formatter.format(sysVoices[sys], noteAreaWidth - RIGHT_PAD)
  })

  // Beam each contiguous run of sounding notes separately — generateBeams
  // treats its input as contiguous, so feeding it the rest-filtered array
  // would beam across rests.
  const beams = built.flatMap((row) => row.map((b) => {
    const runs: InstanceType<typeof VF.StaveNote>[][] = []
    let run: InstanceType<typeof VF.StaveNote>[] = []
    for (const note of b.staveNotes) {
      if (note.isRest()) {
        if (run.length) runs.push(run)
        run = []
      } else {
        run.push(note)
      }
    }
    if (run.length) runs.push(run)
    return runs.flatMap((notes) => VF.Beam.generateBeams(notes))
  }))

  sysVoices.forEach((row, sys) => row.forEach((voice, pi) => voice.draw(context, staves[sys][pi])))
  beams.forEach((set) => set.forEach((beam) => beam.setContext(context).draw()))

  // Ties between a tied note and its successor on the same stave
  // (a tie across a system break is not drawn).
  parts.forEach((p, pi) => {
    p.notes.forEach((item, i) => {
      if (!item.tie || item.rest) return
      const first = locate(pi, i)
      const last = locate(pi, i + 1)
      if (!first || !last || first.sys !== last.sys) return
      const tie = new VF.StaveTie({ firstNote: first.note, lastNote: last.note, firstIndexes: [0], lastIndexes: [0] })
      tie.setContext(context).draw()
    })
  })

  // Overlay the stave labels and issue marks using the real rendered
  // note positions. The markup is generated from the trusted local
  // example registry and escaped.
  const svg = target.querySelector('svg')
  if (svg) {
    // VexFlow sets fixed pixel width/height only. Add a viewBox (and drop
    // any inline size) so CSS can scale the score down to the container
    // width instead of clipping it.
    svg.setAttribute('viewBox', `0 0 ${renderWidth} ${svgHeight}`)
    svg.style.width = ''
    svg.style.height = ''
    const noteX = (pi: number, i: number) => {
      const found = locate(pi, Math.min(i, parts[pi].notes.length - 1))
      return found ? found.note.getAbsoluteX() + 5 : 0
    }
    const noteY = (pi: number, i: number) => {
      const found = locate(pi, Math.min(i, parts[pi].notes.length - 1))
      return found ? found.note.getYs()[0] : 0
    }
    const positions: Positions = {}
    parts.forEach((p, pi) => {
      positions[p.part] = {
        x: (i) => noteX(pi, i),
        y: (i) => noteY(pi, i),
      }
      renderedPositions[p.part] = p.notes.map((_, i) => ({
        x: noteX(pi, i),
        y: noteY(pi, i),
      }))
    })
    const staveLabels = parts
      .map((p, pi) => `<text x="6" y="${staves[0][pi].getYForLine(2) + 4}" class="counterpoint-staff__svg-clef">${escapeHtml(p.label)}</text>`)
      .join('')
    // Dashed ring around every note flagged `issue` — the static
    // fallback draws the same ring, so the problem note stays marked
    // after VexFlow hydrates.
    const issueRings = parts
      .map((p, pi) => p.notes
        .map((note, i) => note.issue && !note.rest
          ? `<circle cx="${noteX(pi, i)}" cy="${noteY(pi, i)}" r="15" class="counterpoint-staff__svg-issue-ring" style="stroke: ${note.color ?? markColor}" />`
          : '')
        .join(''))
      .join('')
    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('class', 'counterpoint-staff__overlay')
    fillSvgGroup(group, staveLabels + issueRings + overlaySvg(d.issues ?? [], positions, svgHeight, markColor))
    svg.appendChild(group)

    // One hidden highlight mark per part — a soft candlelight halo under
    // a crisp gold ring; the playback loop moves it to whichever note is
    // sounding.
    const playheads = document.createElementNS(SVG_NS, 'g')
    playheads.setAttribute('class', 'counterpoint-staff__playheads')
    parts.forEach((p) => {
      const mark = document.createElementNS(SVG_NS, 'g')
      mark.setAttribute('class', 'counterpoint-staff__playhead')
      mark.style.visibility = 'hidden'
      const halo = document.createElementNS(SVG_NS, 'circle')
      halo.setAttribute('r', '17')
      halo.setAttribute('class', 'counterpoint-staff__playhead-halo')
      const ring = document.createElementNS(SVG_NS, 'circle')
      ring.setAttribute('r', '13')
      ring.setAttribute('class', 'counterpoint-staff__playhead-ring')
      mark.appendChild(halo)
      mark.appendChild(ring)
      playheads.appendChild(mark)
      highlightMarks[p.part] = mark
    })
    svg.appendChild(playheads)
  }

  return { renderedPositions, highlightMarks }
}
