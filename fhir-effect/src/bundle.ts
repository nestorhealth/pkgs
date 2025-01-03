import { RESOURCE_TYPES } from "../constants";
import { Schema } from "effect";
import { Resource } from "./resource";

export const ResourceTypeLiterals = Schema.Literal(...RESOURCE_TYPES);

const Bundle = Schema.Struct({
  resourceType: Schema.Literal("Bundle"),
  entry: Schema.Array(
    Schema.Struct({
      resource: Resource
    }),
  ),
});

export const isBundle = Schema.is(Bundle);

export type Bundle = typeof Bundle.Type;

