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
import { isPrimitiveType } from "../typecheck";
import FHIREffectError, { fail } from "../error";
import { ComplexType, PrimitiveType } from "../types";

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

export function props(key: string, removeExtensionPaths = true) {
  return findSchema(key).pipe(
    Effect.flatMap(
      (schema) => Match.value(schema).pipe(
        Match.when({ properties: Match.record }, ({ properties }) => pipe(
          properties,
          Record.keys,
          (keys) => removeExtensionPaths ? Array.filter(keys, key => key.charAt(0) !== "_" && key !== "extension") : keys,
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

type One = number & Brand.Brand<"One">;
const One = Brand.refined<One>(
  (n) => n === 1,
  (n) => Brand.error(`Expected ${n} to equal 1.`),
);
type Inf = number & Brand.Brand<"Inf">;
const Inf = Brand.refined<Inf>(
  (n) => !Number.isFinite(n),
  (n) => Brand.error(`Expected ${n} to be Infinity.`),
);

export type TypeCardinality = [string, One | Inf];

type PrimitiveSingleton = [PrimitiveType, One];
type PrimitiveArray = [PrimitiveType, Inf];
type ComplexSingleton = [ComplexType, One];
type ComplexArray = [ComplexType, Inf];

interface MatchTypeCardinalityHandlers<OPS, OPA, OCS, OCA> {
  onPrimitiveSingleton: (self: PrimitiveSingleton) => OPS;
  onPrimitiveArray: (self: PrimitiveArray) => OPA;
  onComplexSingleton: (self: ComplexSingleton) => OCS;
  onComplexArray: (self: ComplexArray) => OCA;
}
export function matchTypeCardinality<OPS, OPA, OCS, OCA>(
  typecard: TypeCardinality,
  {
    onPrimitiveArray,
    onPrimitiveSingleton,
    onComplexSingleton,
    onComplexArray,
  }: MatchTypeCardinalityHandlers<OPS, OPA, OCS, OCA>,
) {
  const isPrimitiveSingleton = (
    tc: TypeCardinality,
  ): tc is PrimitiveSingleton => isPrimitiveType(tc[0]) && One.is(tc[1]);
  const isPrimitiveArray = (tc: TypeCardinality): tc is PrimitiveArray =>
    isPrimitiveType(tc[0]) && Inf.is(tc[1]);
  const isComplexSingleton = (tc: TypeCardinality): tc is ComplexSingleton =>
    !isPrimitiveType(tc[0]) && One.is(tc[1]);
  const isComplexArray = (tc: TypeCardinality): tc is ComplexArray =>
    !isPrimitiveType(tc[0]) && Inf.is(tc[1]);

  return Match.value(typecard).pipe(
    Match.when(isPrimitiveSingleton, self => onPrimitiveSingleton(self)),
    Match.when(isPrimitiveArray, self => onPrimitiveArray(self)),
    Match.when(isComplexSingleton, self => onComplexSingleton(self)),
    Match.when(isComplexArray, self => onComplexArray(self)),
    Match.orElse(() => { throw new Error() })
  );
}

export function lookupCardinality(
  schema: JSONSchema6,
): Effect.Effect<TypeCardinality, FHIREffectError> {
  return Match.value(schema).pipe(
    Match.when(
      { type: "array", items: { $ref: Match.string } },
      ({ items: { $ref } }) =>
        pipe(
          $ref,
          last,
          Option.match({
            onNone: () =>
              fail(`Couldn't resolve the Array schema items.$ref string`),
            onSome: (refName) =>
              Effect.succeed(Tuple.make(refName, Inf(Infinity))),
          }),
        ),
    ),
    Match.when(
      {
        $ref: Match.string,
      },
      ({ $ref }) =>
        pipe(
          $ref,
          last,
          Option.match({
            onNone: () =>
              fail(`Couldn't resolve the Singleton schema $ref string`),
            onSome: (refName) => Effect.succeed(Tuple.make(refName, One(1))),
          }),
        ),
    ),
    Match.when(isEnumSchema, () => Effect.succeed(Tuple.make("code", One(1)))),
    Match.orElse(() => fail(`Unhandled schema shape for schema ${JSON.stringify(schema, null, 2)}`)),
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