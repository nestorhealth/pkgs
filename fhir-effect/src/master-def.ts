import { Array, Effect, Option, pipe, Record, String } from "effect";
import _master from "../fhir.schema.json";
import { JSONSchema6 } from "json-schema";
import FHIREffectError from "../error";

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
      onNone: () =>
        Effect.fail(
          new FHIREffectError(`No definition found for FHIR key ${key}.`),
        ),
      onSome: (jsonSchema) => Effect.succeed(jsonSchema),
    }),
  );
}

const last = (url: string) => pipe(url, String.split("/"), Array.last);

export function jump(
  schema: JSONSchema6,
): Effect.Effect<JSONSchema6, FHIREffectError> {
  return pipe(
    schema.$ref,
    Option.fromNullable,
    Option.match({
      onNone: () => Effect.fail(
        new FHIREffectError(`No $ref property found for the given schema ${schema}`)
      ),
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
