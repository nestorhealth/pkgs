import { Array, Match, Option, pipe, Tuple } from "effect";

export const splitPath = (path: string) => path.split(".");

export const parent = (path: string) => {
  const split = splitPath(path);
  return split.slice(0, split.length - 1).join(".");
};

export const lastExn = (path: string) => pipe(
  splitPath(path),
  Array.last,
  Option.getOrThrow
);

export const hd = (path: string) => splitPath(path)[0];

export const removeHd = (path: string) => splitPath(path).slice(1).join(".");

export const removeLast = (path: string) => path.split(".").slice(0, -1).join(".");

export const levels = (path: string) => splitPath(path).length - 1;

export const nthExn = (path: string, n: number) => pipe(
  splitPath(path),
  Array.unsafeGet(n)
);

export const joinPaths = (path1: string, path2: string) => Match.value(Tuple.make(path1, path2)).pipe(
  Match.when([ "", "" ], () => ""),
  Match.when([ "", Match.nonEmptyString ], () => path2),
  Match.when([ Match.nonEmptyString, "" ], () => path1),
  Match.orElse(() => `${path1}.${path2}`)
);

export function difference(path1: string, path2: string) {
  return pipe(
    path2.split("."),
    rhsPaths => Array.difference(path1.split("."), rhsPaths),
    Array.join(".")
  );
}
