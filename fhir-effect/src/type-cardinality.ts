import { Brand, Effect, Match, pipe, String, Array, Option, Tuple } from "effect";
import { ComplexType, PrimitiveType } from "../types";
import { isPrimitiveType } from "../typecheck";
import * as Path from "./path";
import * as MasterDef from "./master-def";
import * as UrlLike from "./url-like";
import FHIREffectError, { fail } from "../error";
import { JSONSchema6 } from "json-schema";

export type One = number & Brand.Brand<"One">;
export const One = Brand.refined<One>(
  (n) => n === 1,
  (n) => Brand.error(`Expected ${n} to equal 1.`),
);

export type Inf = number & Brand.Brand<"Inf">;
export const Inf = Brand.refined<Inf>(
  (n) => !Number.isFinite(n),
  (n) => Brand.error(`Expected ${n} to be Infinity.`),
);
  
export type TypeCardinality = [ string, One | Inf ];

type PrimitiveSingleton = [PrimitiveType, One];
type PrimitiveArray = [PrimitiveType, Inf];
type ComplexSingleton = [ComplexType, One];
type ComplexArray = [ComplexType, Inf];

interface MatchHandlers<OPS, OPA, OCS, OCA> {
  onPrimitiveSingleton: (self: PrimitiveSingleton) => OPS;
  onPrimitiveArray: (self: PrimitiveArray) => OPA;
  onComplexSingleton: (self: ComplexSingleton) => OCS;
  onComplexArray: (self: ComplexArray) => OCA;
}
export function match<OPS, OPA, OCS, OCA>(
  typecard: TypeCardinality,
  {
    onPrimitiveArray,
    onPrimitiveSingleton,
    onComplexSingleton,
    onComplexArray,
  }: MatchHandlers<OPS, OPA, OCS, OCA>,
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

function lookupCardinality(
  schema: JSONSchema6,
): Effect.Effect<TypeCardinality, FHIREffectError | Error> {
  return Match.value(schema).pipe(
    Match.when(
      { type: "array", items: { $ref: Match.string } },
      ({ items: { $ref } }) => {
        return UrlLike.last($ref).pipe(
          Effect.map((typeName) => Tuple.make(typeName, Inf(Infinity)))
        )
      }
    ),
    Match.when(
      {
        $ref: Match.string,
      },
      ({ $ref }) => {
        return UrlLike.last($ref).pipe(
          Effect.map((typeName) => Tuple.make(typeName, One(1)))
        )
      }
    ),
    Match.when(MasterDef.isEnumSchema, () => Effect.succeed(Tuple.make("code", One(1)))),
    Match.orElse(() => fail(`Unhandled schema shape for schema ${JSON.stringify(schema, null, 2)}`)),
  );
}

export function lookup(path: string) {
  const head = Path.hd(path);
  const tail = Path.tl(path);
  return MasterDef.findSchema(head).pipe(
    Effect.flatMap((schema) => MasterDef.findPropSchemaRef(schema, tail)),
    Effect.flatMap((propSchema) => lookupCardinality(propSchema))
  )
}
export const lookupExn = (path: string) => Effect.runSync(lookup(path));