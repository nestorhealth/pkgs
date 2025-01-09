import { Schema } from "effect";
export const Leaf = Schema.Union(Schema.String, Schema.Array(Schema.String), Schema.Number, Schema.Array(Schema.Number), Schema.Boolean, Schema.Array(Schema.Boolean));
export const Tree = Schema.Record({
    key: Schema.String,
    value: Schema.Union(Leaf, Schema.suspend(() => Tree), Schema.suspend(() => Schema.Array(Tree)))
});
export const isTree = Schema.is(Tree);
export const validate = Schema.decodeUnknownEither(Tree);
export const encode = Schema.encodeSync(Tree);
