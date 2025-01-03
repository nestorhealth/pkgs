import { suite, test, assert } from "vitest"; 
import * as Tree from "./tree";
import { readSynthea } from "../../../lib/synthea";
import { Array, Either, pipe } from "effect";

suite("FHIR.Tree", () => {
  test("[[ Tree.validate resource ]] is Either.Right for valid examples.", () => pipe(
    readSynthea(),
    Array.flatMap(bundle => bundle.entry.map(entry => entry.resource)),
    Array.forEach(resource => pipe(
      resource,
      Tree.validate,
      Either.match({
        onLeft: () => assert.fail(),
        onRight: _ => assert.ok
      })
    ))
  )),
  test("[[ Tree.validate invalid ]] is Either.Left for invalid examples", () => pipe(
    [
      undefined,
      null,
      0,
      "str",
      true,
      BigInt(1),
      [],
      [0],
      ["str"],
      [true],
      [BigInt(1)]
    ],
    Array.forEach(invalid => pipe(
      invalid,
      Tree.validate,
      Either.match({
        onLeft: () => assert.ok,
        onRight: () => assert.fail()
      })
    ))
  ))
})

