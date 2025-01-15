import { Effect, Match, pipe, Schema } from "effect";
import { readFileSync } from "fs";
import FHIREffectError, { fail } from "../error";
import { ResourceType } from "../types";
import { Path } from "..";

const ElementDefinition = Schema.Struct({
  path: Schema.String,
  short: Schema.optional(Schema.String),
});

const StructureDefinition_snapshot = Schema.Struct({
  element: Schema.Array(ElementDefinition),
});

const StructureDefinition = Schema.Struct({
  resourceType: Schema.Literal("StructureDefinition"),
  id: Schema.String,
  url: Schema.String,
  name: Schema.String,
  status: Schema.Literal("draft", "active", "retired", "unknown"),
  abstract: Schema.Boolean,
  kind: Schema.Literal("primitive-type", "complex-type", "resource", "logical"),
  snapshot: StructureDefinition_snapshot,

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

export function findDefinition(resourceType: string) {
  return pipe(resourceType, readStructureDefinition);
}

export const findDefinitionExn = (resourceType: string) =>
  Effect.runSync(findDefinition(resourceType));

export function baseDefinition(id: string) {
  return findDefinition(id).pipe(
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

export function props(id: string) {
  return findDefinition(id).pipe(
    Effect.map((structDef) =>
      structDef.snapshot.element.map(
        (elementDefinition) => elementDefinition.path,
      ),
    ),
  );
}

export const propsExn = (id: string) => Effect.runSync(props(id));
export const baseDefinitionExn = (id: string) =>
  Effect.runSync(baseDefinition(id));
