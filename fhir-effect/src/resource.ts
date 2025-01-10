import { Effect, Match, Option, pipe, Record, Schema } from "effect";
import { RESOURCE_TYPES } from "../constants";
import * as Tree from "./tree";
import * as MasterDef from "./master-def";
import { ResourceType } from "../types";
import FHIREffectError, { fail } from "../error";

export const Meta = Schema.partial(
  Schema.Struct({
    versionId: Schema.String,
    lastUpdated: Schema.String,
    source: Schema.String,
    profile: Schema.Array(Schema.String),
  }),
);
export type Meta = typeof Meta.Type;

export const Resource = Schema.Struct(
  {
    id: Schema.String,
    resourceType: Schema.Literal(...RESOURCE_TYPES),
    meta: Schema.optional(Meta),
  },
  Tree.Tree,
);
export const isResource = Schema.is(Resource);

export type Resource = typeof Resource.Type;

export function hasProp(
  resourceType: ResourceType,
  propPath: string,
): Effect.Effect<boolean, FHIREffectError> {
  return MasterDef.findSchema(resourceType).pipe(
    Effect.flatMap((definition) =>
      Match.value(definition).pipe(
        Match.when(MasterDef.isComplexSchema, (complexSchema) =>
          pipe(
            complexSchema.properties,
            Record.get(propPath),
            Option.match({
              onNone: () => Effect.succeed(false),
              onSome: () => Effect.succeed(true),
            }),
          ),
        ),
        Match.orElse(() =>
          fail(`No such schema definition found for ${resourceType}`),
        ),
      ),
    ),
  );
}
