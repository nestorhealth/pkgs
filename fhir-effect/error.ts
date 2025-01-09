import { Effect } from "effect"

export default class FHIREffectError extends Error {
  readonly _tag = "FHIREffectError"
};

export function fail(msg?: string) {
  return Effect.fail(new FHIREffectError(msg))
}