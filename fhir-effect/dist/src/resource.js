import { Schema } from "effect";
import { RESOURCE_TYPES } from "../constants";
import * as Tree from "./tree";
export const Meta = Schema.partial(Schema.Struct({
    versionId: Schema.String,
    lastUpdated: Schema.String,
    source: Schema.String,
    profile: Schema.Array(Schema.String)
}));
export const Resource = Schema.Struct({
    id: Schema.String,
    resourceType: Schema.Literal(...RESOURCE_TYPES),
    meta: Schema.optional(Meta)
}, Tree.Tree);
export const isResource = Schema.is(Resource);
