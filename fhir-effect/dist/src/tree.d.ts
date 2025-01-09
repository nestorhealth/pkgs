import { Schema } from "effect";
export type Leaf = string | readonly string[] | number | readonly number[] | boolean | readonly boolean[];
export type Tree = {
    readonly [key: string]: Leaf | Tree | readonly Tree[];
};
export declare const Leaf: Schema.Union<[typeof Schema.String, Schema.Array$<typeof Schema.String>, typeof Schema.Number, Schema.Array$<typeof Schema.Number>, typeof Schema.Boolean, Schema.Array$<typeof Schema.Boolean>]>;
export declare const Tree: Schema.Record$<typeof Schema.String, Schema.Union<[Schema.Union<[typeof Schema.String, Schema.Array$<typeof Schema.String>, typeof Schema.Number, Schema.Array$<typeof Schema.Number>, typeof Schema.Boolean, Schema.Array$<typeof Schema.Boolean>]>, Schema.suspend<Tree, Tree, never>, Schema.suspend<readonly Tree[], readonly Tree[], never>]>>;
export declare const isTree: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions | number) => u is {
    readonly [x: string]: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | Tree | readonly Tree[];
};
export declare const validate: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions) => import("effect/Either").Either<{
    readonly [x: string]: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | Tree | readonly Tree[];
}, import("effect/ParseResult").ParseError>;
export declare const encode: (a: {
    readonly [x: string]: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | Tree | readonly Tree[];
}, overrideOptions?: import("effect/SchemaAST").ParseOptions) => {
    readonly [x: string]: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | Tree | readonly Tree[];
};
