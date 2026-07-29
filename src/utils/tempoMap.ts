/**
 * Tempo- and meter-map math for the generated event data.
 *
 * The engine emits a tempo map (section tempo changes plus the closing
 * ritardando) and a time-signature map alongside the notes, so a single BPM is
 * not enough to place a tick on the clock or to number a bar. Everything that
 * converts between ticks, seconds and bar/beat goes through these helpers.
 */

/** MIDI ticks per quarter note used by the engine. */
export const PPQ = 480

export interface TempoPoint {
  tick: number
  bpm: number
}

export interface TimeSignaturePoint {
  tick: number
  numerator: number
  denominator: number
}

/**
 * The subset of the event data these helpers need. Both maps are optional so
 * the fallback path still works for callers holding older event data.
 */
export interface TimedEventData {
  bpm: number
  tempos?: TempoPoint[]
  time_signatures?: TimeSignaturePoint[]
}

const DEFAULT_SIGNATURE: TimeSignaturePoint = { tick: 0, numerator: 4, denominator: 4 }

/** Tempo points sorted by tick, always anchored by an entry at tick 0. */
export function tempoMap(events: TimedEventData): TempoPoint[] {
  const points = [...(events.tempos ?? [])].sort((a, b) => a.tick - b.tick)
  if (points.length === 0) return [{ tick: 0, bpm: events.bpm || 100 }]
  if (points[0].tick > 0) points.unshift({ tick: 0, bpm: events.bpm || points[0].bpm })
  return points
}

/** Time-signature points sorted by tick, always anchored by an entry at tick 0. */
export function timeSignatureMap(events: TimedEventData): TimeSignaturePoint[] {
  const points = [...(events.time_signatures ?? [])].sort((a, b) => a.tick - b.tick)
  if (points.length === 0) return [DEFAULT_SIGNATURE]
  if (points[0].tick > 0) points.unshift(DEFAULT_SIGNATURE)
  return points
}

/** Wall-clock position of `tick`, in seconds from the start of the piece. */
export function secondsAtTick(tick: number, events: TimedEventData): number {
  const points = tempoMap(events)
  let seconds = 0
  let previousTick = 0
  let bpm = points[0].bpm
  for (const point of points) {
    if (point.tick <= 0) {
      bpm = point.bpm
      continue
    }
    if (point.tick >= tick) break
    seconds += ((point.tick - previousTick) / PPQ) * (60 / bpm)
    previousTick = point.tick
    bpm = point.bpm
  }
  return seconds + ((tick - previousTick) / PPQ) * (60 / bpm)
}

/** Inverse of {@link secondsAtTick}. */
export function tickAtSeconds(seconds: number, events: TimedEventData): number {
  const points = tempoMap(events)
  let remaining = seconds
  let previousTick = 0
  let bpm = points[0].bpm
  for (let i = 1; i < points.length; i++) {
    const segment = ((points[i].tick - previousTick) / PPQ) * (60 / bpm)
    if (remaining < segment) break
    remaining -= segment
    previousTick = points[i].tick
    bpm = points[i].bpm
  }
  return previousTick + ((remaining * bpm) / 60) * PPQ
}

/** The time signature sounding at `tick`. */
export function timeSignatureAtTick(tick: number, events: TimedEventData): TimeSignaturePoint {
  const points = timeSignatureMap(events)
  let active = points[0]
  for (const point of points) {
    if (point.tick > tick) break
    active = point
  }
  return active
}

/** Ticks per bar and per beat under a given time signature. */
export function barTicks(signature: TimeSignaturePoint): { perBar: number; perBeat: number } {
  const perBeat = (PPQ * 4) / signature.denominator
  return { perBar: perBeat * signature.numerator, perBeat }
}

/** One-based bar and beat numbers at `tick`. */
export function barBeatAtTick(tick: number, events: TimedEventData): { bar: number; beat: number } {
  const points = timeSignatureMap(events)
  let barsBefore = 0
  for (let i = 0; i < points.length; i++) {
    const { perBar, perBeat } = barTicks(points[i])
    const sectionEnd = points[i + 1]?.tick ?? Infinity
    if (tick < sectionEnd) {
      const offset = Math.max(0, tick - points[i].tick)
      return {
        bar: barsBefore + Math.floor(offset / perBar) + 1,
        beat: Math.floor((offset % perBar) / perBeat) + 1,
      }
    }
    barsBefore += Math.ceil((sectionEnd - points[i].tick) / perBar)
  }
  return { bar: barsBefore + 1, beat: 1 }
}

/** Total bar count of the piece, honouring every meter change. */
export function totalBars(events: TimedEventData, totalTicks: number): number {
  if (totalTicks <= 0) return 1
  return barBeatAtTick(totalTicks - 1, events).bar
}

/** Bar lines from `startTick` to `endTick` inclusive, with their bar numbers. */
export function barLinesInRange(
  startTick: number,
  endTick: number,
  events: TimedEventData,
): Array<{ tick: number; bar: number }> {
  const points = timeSignatureMap(events)
  const lines: Array<{ tick: number; bar: number }> = []
  let barsBefore = 0
  for (let i = 0; i < points.length; i++) {
    const { perBar } = barTicks(points[i])
    const sectionStart = points[i].tick
    const sectionEnd = points[i + 1]?.tick ?? endTick + perBar
    if (sectionStart > endTick) break
    const firstIndex = Math.max(0, Math.floor((startTick - sectionStart) / perBar))
    for (let index = firstIndex; ; index++) {
      const tick = sectionStart + index * perBar
      if (tick >= sectionEnd || tick > endTick) break
      if (tick >= startTick) lines.push({ tick, bar: barsBefore + index + 1 })
    }
    barsBefore += Math.ceil((sectionEnd - sectionStart) / perBar)
  }
  return lines
}
