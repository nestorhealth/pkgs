import { Array, Match, Option, pipe, String, Tuple } from "effect";

export const split = (path: string) => String.split(path, ".");

export const parent = (path: string) => {
  const sub = split(path);
  return sub.slice(0, split.length - 1).join(".");
};

export function last(path: string) {
  return pipe(
    path,
    split,
    Array.last
  )
}

export const lastExn = (path: string) => pipe(
  split(path),
  Array.last,
  Option.getOrThrow
);

export const hd = (path: string) => split(path)[0];

export const removeHd = (path: string) => split(path).slice(1).join(".");

export const removeLast = (path: string) => path.split(".").slice(0, -1).join(".");

export const length = (path: string) => split(path).length - 1;

export function nth(path: string, n: number) {
  return pipe(
    path,
    split,
    Array.get(n)
  )
}

export const nthExn = (path: string, n: number) => pipe(
  split(path),
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
