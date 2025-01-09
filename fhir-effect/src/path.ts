import { Array, Match, Option, pipe, String, Tuple } from "effect";

export function split(path: string) {
  return String.split(path, ".");
}

export function parent(path: string) {
  const sub = split(path);
  return sub.slice(0, split.length - 1).join(".");
}

export function last(path: string) {
  return pipe(
    path,
    split,
    Array.last
  )
}

export function lastExn(path: string) {
  return pipe(
    split(path),
    Array.last,
    Option.getOrThrow
  );
}

export function hd(path: string) {
  return split(path)[0];
}

export function tl(path: string) {
  return split(path).slice(1).join(".");
}

export function removeLast(path: string) {
  return path.split(".").slice(0, -1).join(".");
}

export function length(path: string) {
  return split(path).length;
}

export function levels(path: string) {
  return split(path).length - 1;
}

export function nth(path: string, n: number) {
  return pipe(
    path,
    split,
    Array.get(n)
  )
}

export function nthExn(path: string, n: number) {
  return pipe(
    split(path),
    Array.unsafeGet(n)
  );
}

export function join(path1: string, path2: string) {
  return Match.value(Tuple.make(path1, path2)).pipe(
    Match.when(["", ""], () => ""),
    Match.when(["", Match.nonEmptyString], () => path2),
    Match.when([Match.nonEmptyString, ""], () => path1),
    Match.orElse(() => `${path1}.${path2}`)
  );
}

export function difference(path1: string, path2: string) {
  return pipe(
    path2.split("."),
    rhsPaths => Array.difference(path1.split("."), rhsPaths),
    Array.join(".")
  );
}
