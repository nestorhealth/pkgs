import { Effect, Match, pipe, Schema } from "effect";
import { readFileSync } from "fs";
import FHIREffectError, { fail } from "../error";
import { ResourceType } from "../types";
import { Path } from "..";

const ElementDefinition = Schema.Struct({
  path: Schema.String,
  short: Schema.optional(Schema.String),
  min: Schema.Literal(0, 1),
  max: Schema.Literal("1", "*"),
  type: Schema.Array(
    Schema.Struct({
      code: Schema.String,
      profile: Schema.Array(Schema.String),
      targetProfile: Schema.Array(Schema.String),
      aggregation: Schema.Array(Schema.String),
      versioning: Schema.optional(Schema.String),
    }),
  ),
});

const StructureDefinition = Schema.Struct({
  resourceType: Schema.Literal("StructureDefinition"),
  id: Schema.String,
  url: Schema.String,
  name: Schema.String,
  status: Schema.Literal("draft", "active", "retired", "unknown"),
  abstract: Schema.Boolean,
  kind: Schema.Literal("primitive-type", "complex-type", "resource", "logical"),
  snapshot: Schema.Struct({
    element: Schema.Array(ElementDefinition),
  }),

  baseDefinition: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  experimental: Schema.optional(Schema.Boolean),
  date: Schema.optional(Schema.String),
  publisher: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  purpose: Schema.optional(Schema.String),
  copyright: Schema.optional(Schema.String),
  copyrightLabel: Schema.optional(Schema.String),
  version: Schema.optional(Schema.String),
});

type StructureDefinition = typeof StructureDefinition.Type;

const R4_PATH = "node_modules/hl7.fhir.r4.core";
const read = (filename: string) =>
  Effect.try(
    (): StructureDefinition =>
      JSON.parse(readFileSync(`${R4_PATH}/${filename}`, "utf8")),
  );
const makeStructureDefinitionName = (tail: string) =>
  `StructureDefinition-${tail}.json`;
const readStructureDefinition = (
  definitionName: string,
): Effect.Effect<StructureDefinition, Error> =>
  pipe(definitionName, makeStructureDefinitionName, (fileName) =>
    read(fileName),
  );
const toss = (msg?: string) => {
  throw new FHIREffectError(msg);
};
const last = (urlLike: string) =>
  pipe(urlLike.split("/"), (split) => split[split.length - 1]);

export function structureDefinition(resourceType: string) {
  return pipe(resourceType, readStructureDefinition);
}

export const structureDefinitionExn = (resourceType: string) =>
  Effect.runSync(structureDefinition(resourceType));

export function resolve(id: string) {
  return structureDefinition(id).pipe(
    Effect.flatMap((structureDefinition) =>
      Match.value(structureDefinition.baseDefinition).pipe(
        Match.when(Match.undefined, () =>
          fail(`Base Definition of ${id} not located.`),
        ),
        Match.orElse((definitionUrl) =>
          pipe(definitionUrl, last, readStructureDefinition),
        ),
      ),
    ),
  );
}

export function snapshot(id: string) {
  return structureDefinition(id).pipe(
    Effect.map((structDef) => structDef.snapshot),
  );
}

export function lookupChild(path: string) {
  return pipe(path, Path.hd, structureDefinition).pipe(
    Effect.flatMap(({ snapshot: { element } }) =>
      Effect.fromNullable(
        element.find((elementDefinition) => elementDefinition.path === path),
      ),
    ),
  );
}

export const lookupChildExn = (path: string) => Effect.runSync(lookupChild(path));

export const snapshotExn = (id: string) => Effect.runSync(snapshot(id));

console.log(lookupChildExn("Patient.id"))