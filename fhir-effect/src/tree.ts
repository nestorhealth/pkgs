import { Schema } from "effect";

export type Leaf =
  | string
  | readonly string[]
  | number
  | readonly number[]
  | boolean
  | readonly boolean[];

export type Tree = {
  readonly [key: string]:
  | Leaf
  | Tree
  | readonly Tree[]
}

export const Leaf = Schema.Union(
  Schema.String,
  Schema.Array(Schema.String),
  Schema.Number,
  Schema.Array(Schema.Number),
  Schema.Boolean,
  Schema.Array(Schema.Boolean),
)

export const Tree = Schema.Record({
  key: Schema.String,
  value: Schema.Union(
    Leaf,
    Schema.suspend(
      (): Schema.Schema<Tree> => Tree
    ),
    Schema.suspend(
      (): Schema.Schema<readonly Tree[]> => Schema.Array(Tree)
    )
  )
});

export const isTree = Schema.is(Tree);
export const validate = Schema.decodeUnknownEither(Tree);
export const encode = Schema.encodeSync(Tree);

