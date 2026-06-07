import type { StaffExampleDef } from './types'
import { primerExamples } from './primer'
import { primerBachExamples } from './primer.bach'
import { intervalExamples } from './intervals'
import { intervalBachExamples } from './intervals.bach'
import { motionExamples } from './motion'
import { motionBachExamples } from './motion.bach'
import { dissonanceExamples } from './dissonance'
import { dissonanceBachExamples } from './dissonance.bach'
import { melodyExamples } from './melody'
import { melodyBachExamples } from './melody.bach'
import { tonalityExamples } from './tonality'
import { tonalityBachExamples } from './tonality.bach'
import { fugueExamples } from './fugue'
import { fugueBachExamples } from './fugue.bach'
import { formConstraintExamples } from './formConstraints'
import { formConstraintBachExamples } from './formConstraints.bach'

export * from './types'

/**
 * All staff examples, keyed by example id used in `<CounterpointStaff example="...">`.
 * Each chapter contributes its teaching examples plus its "From Bach" corpus
 * quotations (the `*.bach.ts` siblings).
 */
export const staffExampleRegistry: Record<string, StaffExampleDef> = {
  ...primerExamples,
  ...primerBachExamples,
  ...intervalExamples,
  ...intervalBachExamples,
  ...motionExamples,
  ...motionBachExamples,
  ...dissonanceExamples,
  ...dissonanceBachExamples,
  ...melodyExamples,
  ...melodyBachExamples,
  ...tonalityExamples,
  ...tonalityBachExamples,
  ...fugueExamples,
  ...fugueBachExamples,
  ...formConstraintExamples,
  ...formConstraintBachExamples,
}

/** Look up an example definition; returns undefined for unknown ids. */
export function getStaffExample(id: string): StaffExampleDef | undefined {
  return staffExampleRegistry[id]
}
