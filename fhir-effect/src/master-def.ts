import { Array, Effect, Match, Option, pipe, Record, String } from "effect";
import _master from "../fhir.schema.json";
import { JSONSchema6, JSONSchema6Object } from "json-schema";
import FHIREffectError, { fail } from "../error";

interface MasterSchema {
  $schema: string;
  id: string;
  description: string;
  discriminator: {
    propertyName: string;
    mapping: Record<string, string>;
  };
  oneOf: { $ref: string }[];
  definitions: Record<string, JSONSchema6>;
}
const master: MasterSchema = _master as any as MasterSchema;

export function findDefinition(
  key: string,
): Effect.Effect<JSONSchema6, FHIREffectError> {
  return pipe(
    Record.get(master.definitions, key),
    Option.match({
      onNone: () => fail(`No definition found for FHIR key ${key}.`),
      onSome: (jsonSchema) => Effect.succeed(jsonSchema),
    }),
  );
}

export function lookup(
  schema: JSONSchema6,
  property: string
): Effect.Effect<JSONSchema6, FHIREffectError> {
  return Match.value(schema).pipe(
    Match.when({ type: "object", properties: Match.record }, (schema) => pipe(
      schema.properties,
      Record.get(property),
      Option.match({
        onNone: () => fail(`Property ${property} does not exist for the provided schema.`),
        onSome: (propSchema) => Match.value(propSchema).pipe(
          Match.when(Match.boolean, () => fail(`Expected a JSON Schema object but got boolean...`)),
          Match.orElse(
            (propSchema) => Effect.succeed(propSchema)
          )
        )
      })
    )),
    Match.orElse(() => fail(`Expected an Object schema, but got ${schema.type}`))
  )
}

const last = (url: string) => pipe(url, String.split("/"), Array.last);

export function jump(
  schema: JSONSchema6,
): Effect.Effect<JSONSchema6, FHIREffectError> {
  return pipe(
    schema.$ref,
    Option.fromNullable,
    Option.match({
      onNone: () => fail(`No $ref property found for the given schema ${schema}`),
      onSome: (ref) => pipe(
        ref,
        last,
        Option.match({
          onNone: () => Effect.die(new Error(`Undefined $ref property`)),
          onSome: (schemaName) => findDefinition(schemaName)
        })
      )
    })
  )
}
