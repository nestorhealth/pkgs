import { Effect, Exit } from "effect";
import * as MasterDef from "./master-def";
import { RESOURCE_TYPES } from "../constants";
import { describe, suite, test, expect } from "vitest";
import { JSONSchema6 } from "json-schema";

describe("MasterDef module", () => {
  suite("[[ MasterDef.findDefinition (key : string) : JSONSchema6 ]]", () => {
    test("Success Example Case 1 : Patient Resource Type", () => {
      const program = MasterDef.findDefinition("Patient");
      const result = Effect.runSyncExit(program);
      expect(Exit.isSuccess(result)).toBe(true);
    });
    test("Success Example Case 2 : RESOURCE_TYPES constants", () => {
      const program = Effect.forEach(RESOURCE_TYPES, (rt) =>
        MasterDef.findDefinition(rt),
      );
      const result = Effect.runSyncExit(program);
      expect(Exit.isSuccess(result)).toBe(true);
    });

    test("Failure Example Case 1 : Bad input", () => {
      const program = MasterDef.findDefinition("lol");
      const result = Effect.runSyncExit(program);
      expect(Exit.isFailure(result)).toBe(true);
    });
    test("Failure Example Case 2 : RESOURCE_TYPES constants + 1 bad input)", () => {
      const inputs = ["bad", ...RESOURCE_TYPES];
      const program = Effect.forEach(inputs, (rt) =>
        MasterDef.findDefinition(rt),
      );
      const result = Effect.runSyncExit(program);
      expect(Exit.isFailure(result)).toBe(true);
    });
  });

  suite("[[ MasterDef.jump (schema: JSONSchema6) : JSONSchema6 ]]", () => {
    test("Success Example Case 1 : Valid { $ref } record", () => {
      const input = { $ref: "#/definitions/date" };
      const result = Effect.runSyncExit(MasterDef.jump(input));
      expect(Exit.isSuccess(result)).toBe(true);
    });
    test("Success Example Case 2 : Patient property", () => {
      const program = Effect.runSync(MasterDef.findDefinition("Patient"));
      const result = Effect.runSyncExit(MasterDef.jump(program.properties!["active"] as any));
      expect(Exit.isSuccess(result)).toBe(true);
    });
    
    test("Failure Example Case 1 : (No such definition)", () => {
      const input = { $ref: "#/definitions/lol" };
      const program = MasterDef.jump(input);
      const result = Effect.runSyncExit(program);
      expect(Exit.isFailure(result)).toBe(true);
    })
  });
  
  suite("[[ MasterDef.lookupCardinality (schema : JSONSchema6) ]]", () => {
    test("Success Example Case 1 : Hardcoded Array Schema", () => {
      const input: JSONSchema6 = { type: "array", items: { $ref: "#/definitions/string" } };
      const program = MasterDef.lookupCardinality(input);
      const result = Effect.runSync(program);
      expect(result).toEqual([ "string", Infinity ]);
    })
    test("Success Example Case 2 : Hardcoded Singleton Schema", () => {
      const input: JSONSchema6 = { $ref: "#/definitions/url" };
      const program = MasterDef.lookupCardinality(input);
      const result = Effect.runSync(program);
      expect(result).toEqual([ "url", 1 ]);
    })
  })
});
