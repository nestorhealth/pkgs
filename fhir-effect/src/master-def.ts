import {
  Array,
  Brand,
  Effect,
  Match,
  Option,
  pipe,
  Record,
  Schema,
  String,
  Tuple,
} from "effect";
import _master from "../fhir.schema.json";
import { JSONSchema6, JSONSchema6Definition } from "json-schema";
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

export function findSchema(
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

export function props(key: string, ignoreExtensions = true) {
  return findSchema(key).pipe(
    Effect.flatMap(
      (schema) => Match.value(schema).pipe(
        Match.when({ properties: Match.record }, ({ properties }) => pipe(
          properties,
          Record.keys,
          (keys) => ignoreExtensions ? Array.filter(keys, key => key.charAt(0) !== "_" && key !== "extension" && key !== "modifierExtension") : keys,
          Effect.succeed
        )),
        Match.orElse(({ type }) => fail(`Expected key ${key} to be an object type, but got ${type}`))
      )
    )
  )
}

export function findPropSchemaRef(
  schema: JSONSchema6,
  property: string,
): Effect.Effect<JSONSchema6, FHIREffectError> {
  return Match.value(schema).pipe(
    Match.when({ type: "object", properties: Match.record }, (schema) =>
      pipe(
        schema.properties,
        Record.get(property),
        Option.match({
          onNone: () =>
            fail(
              `Property ${property} does not exist for the provided schema.`,
            ),
          onSome: (propSchema) =>
            Match.value(propSchema).pipe(
              Match.when(Match.boolean, () =>
                fail(`Expected a JSON Schema object but got boolean...`),
              ),
              Match.orElse((propSchema) => Effect.succeed(propSchema)),
            ),
        }),
      ),
    ),
    Match.orElse(() =>
      fail(`Expected an Object schema, but got ${schema.type}`),
    ),
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
      onNone: () =>
        fail(`No $ref property found for the given schema ${schema}`),
      onSome: (ref) =>
        pipe(
          ref,
          last,
          Option.match({
            onNone: () => Effect.die(new Error(`Undefined $ref property`)),
            onSome: (schemaName) => findSchema(schemaName),
          }),
        ),
    }),
  );
}

type ComplexSchema = Omit<JSONSchema6, "properties" | "type"> & {
  properties: {
    [key: string]: JSONSchema6Definition;
  };
  type: "object";
};
export function isComplexSchema(schema: JSONSchema6): schema is ComplexSchema {
  return schema.properties !== undefined && schema.type === "object";
}

type RefSchema = Omit<JSONSchema6, "$ref"> & {
  $ref: string;
};
export function isRefSchema(schema: JSONSchema6): schema is RefSchema {
  return schema.$ref !== undefined;
}

type EnumSchema = Omit<JSONSchema6, "enum"> & {
  enum: string[];
}
export function isEnumSchema(schema: JSONSchema6): schema is EnumSchema {
  return schema.enum !== undefined && Array.isArray(schema.enum) && Array.every(schema.enum, code => typeof code === "string");
}