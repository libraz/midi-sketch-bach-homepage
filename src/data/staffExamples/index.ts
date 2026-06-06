import type { StaffExampleDef } from './types'
import { primerExamples } from './primer'
import { intervalExamples } from './intervals'
import { motionExamples } from './motion'
import { dissonanceExamples } from './dissonance'
import { melodyExamples } from './melody'
import { tonalityExamples } from './tonality'
import { fugueExamples } from './fugue'
import { formConstraintExamples } from './formConstraints'

export * from './types'

/** All staff examples, keyed by example id used in `<CounterpointStaff example="...">`. */
export const staffExampleRegistry: Record<string, StaffExampleDef> = {
  ...primerExamples,
  ...intervalExamples,
  ...motionExamples,
  ...dissonanceExamples,
  ...melodyExamples,
  ...tonalityExamples,
  ...fugueExamples,
  ...formConstraintExamples,
}

/** Look up an example definition; returns undefined for unknown ids. */
export function getStaffExample(id: string): StaffExampleDef | undefined {
  return staffExampleRegistry[id]
}
