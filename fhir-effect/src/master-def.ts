import { Array, Brand, Effect, Match, Option, pipe, Record, String, Tuple } from "effect";
import _master from "../fhir.schema.json";
import { JSONSchema6, JSONSchema6Definition, JSONSchema6Object } from "json-schema";
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

export function findPropSchema(
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

type One = number & Brand.Brand<"One">;
const One = Brand.refined<One>(
  (n) => n === 1,
  (n) => Brand.error(`Expected ${n} to equal 1.`)
)
type Inf = number & Brand.Brand<"Inf">;
const Inf = Brand.refined<Inf>(
  (n) => !Number.isFinite(n),
  (n) => Brand.error(`Expected ${n} to be Infinity.`),
);

type TypeCardinality = [string, One | Inf];

export function lookupCardinality(schema: JSONSchema6): Effect.Effect<TypeCardinality, FHIREffectError> {
  return Match.value(schema).pipe(
    Match.when(
      { type: "array", items: { $ref: Match.string } },
      ({ items: { $ref } }) => pipe(
        $ref,
        last,
        Option.match({
          onNone: () => fail(`Couldn't resolve the Array schema items.$ref string`),
          onSome: (refName) => Effect.succeed(
            Tuple.make(refName, Inf(Infinity))
          )
        })
      )
    ),
    Match.when({
      $ref: Match.string
    }, ({ $ref }) => pipe(
      $ref,
      last,
      Option.match({
        onNone: () => fail(`Couldn't resolve the Singleton schema $ref string`),
        onSome: (refName) => Effect.succeed(
          Tuple.make(refName, One(1))
        )
      })
    )),
    Match.orElse(() => fail(`Unhandled schema shape for schema ${schema}`))
  )
}

type ComplexSchema = Omit<JSONSchema6, "properties" | "type"> & {
  properties: {
    [key: string]: JSONSchema6Definition;
  },
  type: "object"
}
export function isComplexSchema(schema: JSONSchema6): schema is ComplexSchema {
  return schema.properties !== undefined && schema.type === "object";
}